import { auth } from "@clerk/nextjs/server";
import { CartView } from "@/components/cart/cart-view";
import { getActivePromotion } from "@/lib/queries";
import { releaseUnpaidOrder } from "@/lib/stock";
import { z } from "zod";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  stripe_key: "Payments are unavailable right now.",
  order: "The order could not be saved. Try again.",
  stripe: "Stripe Checkout could not be opened.",
  rate: "Too many payment attempts. Wait a few minutes and try again.",
  stock: "That item is no longer available in the quantity you chose.",
  promo: "That code is not active, or this bag has no featured products.",
  canceled: "Checkout was canceled. Your bag is still here.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; canceled?: string; order?: string }>;
}) {
  const params = await searchParams;
  const canceledOrder = z.string().uuid().safeParse(params.order);
  if (params.canceled && canceledOrder.success) {
    const { userId } = await auth();
    if (userId) await releaseUnpaidOrder(canceledOrder.data, userId);
  }
  const notice = params.canceled ? notices.canceled : params.error ? notices[params.error] : undefined;
  const promotion = await getActivePromotion();
  return (
    <CartView
      notice={notice}
      promotion={promotion ? { code: promotion.code, discountPercent: promotion.discount_percent } : null}
    />
  );
}
