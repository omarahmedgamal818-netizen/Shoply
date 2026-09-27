"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { discountedUnitCents, lineFeeCents, linePayoutCents } from "@/lib/pricing";
import { checkoutSchema, promoCodeSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductsBySlugs, getPromotionByCode } from "@/lib/queries";
import { reserveProductStock, restoreProductStock } from "@/lib/stock";
import { appOrigin, getStripe } from "@/lib/stripe";
import { SHIPPING_FLAT_CENTS } from "@/lib/types";

export async function loadCartProducts(slugs: string[]) {
  if (!consumeRateLimit("cart-load", 60, 60_000)) return [];
  return getProductsBySlugs(slugs);
}

export async function startStripeCheckout(
  lines: { slug: string; quantity: number; size?: string }[],
  code?: string,
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!consumeRateLimit(`checkout:${userId}`, 8, 10 * 60_000)) redirect("/cart?error=rate");
  const parsed = checkoutSchema.safeParse(lines);
  if (!parsed.success) redirect("/cart");
  lines = parsed.data;

  const stripe = getStripe();
  if (!stripe) redirect("/cart?error=stripe_key");

  const products = await getProductsBySlugs(lines.map((line) => line.slug));
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const items = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product || product.vendors?.status !== "active" || product.stock < 1) redirect("/cart?error=stock");
    if (line.quantity > product.stock) redirect("/cart?error=stock");
    if (product.sizes.length > 0 && (!line.size || !product.sizes.includes(line.size))) redirect("/cart");
    items.push({ product, quantity: line.quantity, size: line.size });
  }

  if (items.length === 0) redirect("/cart");

  let discountPercent = 0;
  let promoCode: string | null = null;
  const trimmedCode = (code ?? "").trim();
  if (trimmedCode) {
    const parsedCode = promoCodeSchema.safeParse(trimmedCode);
    if (!parsedCode.success) redirect("/cart?error=promo");
    const promotion = await getPromotionByCode(parsedCode.data);
    if (!promotion || !items.some((item) => item.product.is_featured)) redirect("/cart?error=promo");
    discountPercent = promotion.discount_percent;
    promoCode = promotion.code;
  }

  const priced = items.map((item) => ({
    ...item,
    unit: discountedUnitCents(item.product.price_cents, item.product.is_featured, discountPercent),
  }));
  const subtotal = priced.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0);
  const discount = priced.reduce((sum, item) => sum + (item.product.price_cents - item.unit) * item.quantity, 0);
  const platformFee = priced.reduce((sum, item) => sum + lineFeeCents(item.unit, item.quantity), 0);
  const total = subtotal - discount + SHIPPING_FLAT_CENTS;
  const orderNumber = `SL-${Date.now().toString(36).toUpperCase()}`;

  const supabase = createAdminClient();
  const reserved: { id: string; quantity: number }[] = [];
  const needed = new Map<string, { quantity: number; stock: number }>();
  for (const item of items) {
    const current = needed.get(item.product.id) ?? { quantity: 0, stock: item.product.stock };
    current.quantity += item.quantity;
    needed.set(item.product.id, current);
  }
  for (const [productId, need] of needed) {
    if (need.quantity > need.stock) redirect("/cart?error=stock");
    const reservedOk = await reserveProductStock(supabase, productId, need.quantity, need.stock);
    if (!reservedOk) {
      for (const prior of reserved) await restoreProductStock(supabase, prior.id, prior.quantity);
      redirect("/cart?error=stock");
    }
    reserved.push({ id: productId, quantity: need.quantity });
  }

  const rollback = async () => {
    for (const prior of reserved) await restoreProductStock(supabase, prior.id, prior.quantity);
  };

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      buyer_id: userId,
      status: "processing",
      subtotal_cents: subtotal,
      platform_fee_cents: platformFee,
      shipping_cents: SHIPPING_FLAT_CENTS,
      total_cents: total,
      discount_cents: discount,
      promo_code: promoCode,
    })
    .select("id")
    .single();

  if (error || !order) {
    await rollback();
    redirect("/cart?error=order");
  }

  const { error: itemError } = await supabase.from("order_items").insert(
    priced.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      vendor_id: item.product.vendor_id,
      title: item.size ? `${item.product.title} — Size ${item.size}` : item.product.title,
      image_url: item.product.image_url,
      vendor_name: item.product.vendors?.store_name ?? "Shoply seller",
      unit_price_cents: item.unit,
      quantity: item.quantity,
      payout_cents: linePayoutCents(item.unit, item.quantity),
      payout_status: "held" as const,
    })),
  );

  if (itemError) {
    await supabase.from("orders").delete().eq("id", order.id);
    await rollback();
    redirect("/cart?error=order");
  }

  const origin = await appOrigin(await headers());
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    session = await stripe.checkout.sessions.create({
    mode: "payment",
    managed_payments: { enabled: false },
    success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?canceled=1&order=${order.id}`,
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: SHIPPING_FLAT_CENTS, currency: "usd" },
          display_name: "Flat shipping",
        },
      },
    ],
    line_items: priced.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.unit,
        product_data: { name: item.size ? `${item.product.title} — Size ${item.size}` : item.product.title },
      },
    })),
    metadata: { order_id: order.id, buyer_id: userId, promo_code: promoCode ?? "" },
    });
  } catch {
    await supabase.from("orders").delete().eq("id", order.id);
    await rollback();
    redirect("/cart?error=stripe");
  }

  if (!session.url) {
    await supabase.from("orders").delete().eq("id", order.id);
    await rollback();
    redirect("/cart?error=stripe");
  }
  redirect(session.url);
}
