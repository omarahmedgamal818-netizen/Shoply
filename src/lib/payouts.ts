import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

function first<T>(value: T | T[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function fulfillPaidSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId || session.payment_status !== "paid") return;

  const supabase = createAdminClient();
  const address = session.customer_details?.address;
  const shipping = address
    ? [address.line1, address.line2, address.city, address.state, address.postal_code, address.country]
        .filter((part) => Boolean(part))
        .join(", ")
    : null;

  await supabase
    .from("orders")
    .update({
      status: "paid",
      shipping_address: shipping,
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    })
    .eq("id", orderId)
    .eq("status", "processing");

  const { data: items } = await supabase
    .from("order_items")
    .select("vendor_id")
    .eq("order_id", orderId);

  const vendorIds = [...new Set((items ?? []).flatMap((item) => (item.vendor_id ? [item.vendor_id] : [])))];
  for (const vendorId of vendorIds) {
    await releaseHeldPayouts(vendorId);
  }
}

export async function releaseHeldPayouts(vendorId: string) {
  const stripe = getStripe();
  if (!stripe) return;

  const supabase = createAdminClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("stripe_account_id, stripe_status")
    .eq("id", vendorId)
    .maybeSingle();

  if (!vendor?.stripe_account_id || vendor.stripe_status !== "connected") return;

  const { data: held } = await supabase
    .from("order_items")
    .select("id, order_id, payout_cents, orders!inner(status, stripe_payment_intent)")
    .eq("vendor_id", vendorId)
    .eq("payout_status", "held");

  const groups = new Map<string, { ids: string[]; amount: number; paymentIntentId: string | null }>();
  for (const item of held ?? []) {
    const order = first(item.orders);
    if (order?.status !== "paid" || !item.order_id) continue;
    const current = groups.get(item.order_id) ?? { ids: [], amount: 0, paymentIntentId: order.stripe_payment_intent };
    current.ids.push(item.id);
    current.amount += item.payout_cents;
    groups.set(item.order_id, current);
  }

  for (const [orderId, group] of groups) {
    if (group.amount <= 0 || group.ids.length === 0) continue;

    const { data: claimed } = await supabase
      .from("order_items")
      .update({ payout_status: "transferred" })
      .in("id", group.ids)
      .eq("payout_status", "held")
      .eq("vendor_id", vendorId)
      .select("id, payout_cents");

    if (!claimed?.length) continue;
    const amount = claimed.reduce((sum, item) => sum + item.payout_cents, 0);
    const claimedIds = claimed.map((item) => item.id);
    if (amount <= 0) continue;

    let sourceTransaction: string | undefined;
    if (group.paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(group.paymentIntentId);
      if (typeof intent.latest_charge === "string") sourceTransaction = intent.latest_charge;
    }

    try {
      const transfer = await stripe.transfers.create(
        {
          amount,
          currency: "usd",
          destination: vendor.stripe_account_id,
          ...(sourceTransaction ? { source_transaction: sourceTransaction } : {}),
        },
        { idempotencyKey: `shoply-payout-${orderId}-${vendorId}` },
      );
      await supabase.from("order_items").update({ stripe_transfer_id: transfer.id }).in("id", claimedIds);
    } catch {
      await supabase
        .from("order_items")
        .update({ payout_status: "held" })
        .in("id", claimedIds)
        .is("stripe_transfer_id", null);
    }
  }
}
