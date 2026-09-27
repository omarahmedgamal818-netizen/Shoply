import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { fulfillPaidSession } from "@/lib/payouts";
import { consumeRateLimit } from "@/lib/rate-limit";
import { stripeSessionSchema } from "@/lib/schemas";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
        <h1 className="text-headline">Orders</h1>
        <Link href="/sign-in" className="mt-4 inline-flex text-body-lg text-ink-black">
          Sign in to see your orders
        </Link>
      </div>
    );
  }

  const { session_id: sessionId } = await searchParams;
  const parsedSession = stripeSessionSchema.safeParse(sessionId);
  if (parsedSession.success && consumeRateLimit(`orders:${userId}`, 10, 60_000)) {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(parsedSession.data);
      if (session.metadata?.buyer_id === userId) await fulfillPaidSession(session);
    }
  }

  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total_cents, discount_cents, promo_code, created_at, order_items(id, title, image_url, quantity, unit_price_cents, fulfillment_status, tracking_note, vendor_name)",
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
      <h1 className="text-headline">Orders</h1>
      <ul className="mt-8 flex flex-col gap-4">
        {(orders ?? []).map((order) => (
          <li key={order.id} className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-body-sm">{order.order_number}</p>
              <p className="text-caption uppercase">{order.status}</p>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {(order.order_items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[12px] bg-canvas-mist">
                    {item.image_url ? (
                      <Image src={item.image_url} alt="" fill className="object-cover" sizes="56px" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-body-sm text-muted-gray">
                      {item.vendor_name} · {item.quantity} × {formatCurrency(item.unit_price_cents)}
                    </p>
                    <p className="text-body-sm capitalize text-ink-black">{item.fulfillment_status}</p>
                    {item.tracking_note ? <p className="text-body-sm text-muted-gray">{item.tracking_note}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
            {order.discount_cents > 0 ? (
              <p className="mt-4 text-body-sm text-muted-gray">
                Promo {order.promo_code} −{formatCurrency(order.discount_cents)}
              </p>
            ) : null}
            <p className="mt-4 font-bold">{formatCurrency(order.total_cents)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
