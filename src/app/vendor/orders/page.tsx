import { updateShipment } from "@/app/vendor/orders/actions";
import { formatCurrency } from "@/lib/utils";
import { getVendorOrderLines, requireOwnedVendor } from "@/lib/vendor";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { vendor } = await requireOwnedVendor();
  const lines = await getVendorOrderLines(vendor.id);

  return (
    <div>
      <h1 className="text-headline">Orders</h1>
      <p className="mt-2 max-w-2xl text-body text-muted-gray">
        Each line is a product from your shop. Buyers pay the listed price. Your payout is 95% and stays held until Stripe is connected.
      </p>
      {params.saved ? <p className="mt-3 text-body-sm text-ink-black">Shipment updated.</p> : null}
      {params.error === "unpaid" ? (
        <p className="mt-3 text-body-sm text-ink-black">Ship a line after the buyer has paid.</p>
      ) : null}
      {params.error === "save" || params.error === "rate" ? (
        <p className="mt-3 text-body-sm text-ink-black">That shipment could not be saved.</p>
      ) : null}
      <div className="mt-8 overflow-x-auto rounded-[28px] bg-pure-white shadow-sm-2">
        <table className="w-full text-left text-body-sm">
          <thead className="text-muted-gray">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Shipment</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted-gray">
                  No orders yet.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-t border-faint-border">
                  <td className="px-4 py-3">
                    <p>{line.order_number}</p>
                    <p className="text-[11px] text-muted-gray">
                      {line.created_at ? dateFormat.format(new Date(line.created_at)) : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{line.title}</td>
                  <td className="px-4 py-3">{line.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(line.payout_cents)}</td>
                  <td className="px-4 py-3 capitalize">
                    {line.fulfillment_status}
                    <span className="text-muted-gray"> · {line.payout_status === "transferred" ? "paid out" : "held"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {line.status === "paid" || line.status === "shipped" || line.status === "delivered" ? (
                      <form action={updateShipment} className="flex min-w-56 flex-col gap-2">
                        <input type="hidden" name="id" value={line.id} />
                        <input
                          name="tracking"
                          defaultValue={line.tracking_note ?? ""}
                          placeholder="Tracking note"
                          maxLength={120}
                          className="h-9 rounded-full border border-faint-border px-3"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            name="fulfillment"
                            value="shipped"
                            className="h-8 rounded-full bg-shop-violet px-3 text-[12px] text-pure-white"
                          >
                            Shipped
                          </button>
                          <button
                            type="submit"
                            name="fulfillment"
                            value="delivered"
                            className="h-8 rounded-full border border-faint-border px-3 text-[12px]"
                          >
                            Delivered
                          </button>
                        </div>
                      </form>
                    ) : (
                      <span className="text-muted-gray">Waiting for payment</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
