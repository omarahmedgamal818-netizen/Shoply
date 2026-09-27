import { Stat } from "@/components/vendor/stat";
import { formatCurrency } from "@/lib/utils";
import { getVendorOrderLines, requireOwnedVendor } from "@/lib/vendor";

export const dynamic = "force-dynamic";

export default async function VendorAnalysisPage() {
  const { supabase, vendor } = await requireOwnedVendor();
  const [lines, { data: products }] = await Promise.all([
    getVendorOrderLines(vendor.id),
    supabase.from("products").select("id, is_published, stock").eq("vendor_id", vendor.id),
  ]);

  const sales = lines.reduce((sum, line) => sum + line.unit_price_cents * line.quantity, 0);
  const payouts = lines.reduce((sum, line) => sum + line.payout_cents, 0);
  const unitsSold = lines.reduce((sum, line) => sum + line.quantity, 0);
  const held = lines.filter((line) => line.payout_status === "held").reduce((sum, line) => sum + line.payout_cents, 0);
  const transferred = payouts - held;
  const catalog = products ?? [];
  const published = catalog.filter((product) => product.is_published).length;

  const weeks = lastEightWeeks();
  for (const line of lines) {
    if (!line.created_at) continue;
    const at = new Date(line.created_at).getTime();
    const week = weeks.find((item) => at >= item.start && at < item.end);
    if (week) week.cents += line.unit_price_cents * line.quantity;
  }
  const recentSales = weeks.reduce((sum, week) => sum + week.cents, 0);
  const peak = Math.max(...weeks.map((week) => week.cents), 1);

  const byProduct = new Map<string, { title: string; units: number; cents: number }>();
  for (const line of lines) {
    const current = byProduct.get(line.title) ?? { title: line.title, units: 0, cents: 0 };
    current.units += line.quantity;
    current.cents += line.unit_price_cents * line.quantity;
    byProduct.set(line.title, current);
  }
  const top = [...byProduct.values()].sort((a, b) => b.cents - a.cents).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline">Analysis</h1>
        <p className="mt-2 text-body text-muted-gray">Sales and payouts for {vendor.store_name}.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sales" value={formatCurrency(sales)} hint="Listed price × quantity" />
        <Stat label="Your payouts" value={formatCurrency(payouts)} hint="95% of sales" />
        <Stat label="Units sold" value={String(unitsSold)} />
        <Stat label="Catalog" value={String(published)} hint={`${catalog.length} products, ${catalog.reduce((sum, product) => sum + Number(product.stock), 0)} in stock`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
          <p className="text-[11px] text-muted-gray">Sales, last 8 weeks</p>
          {recentSales === 0 ? (
            <p className="mt-4 text-body-sm text-muted-gray">No sales in the last 8 weeks.</p>
          ) : (
            <>
              <div className="mt-4 flex h-28 items-end gap-2">
                {weeks.map((week) => (
                  <div key={week.label} className="flex h-full flex-1 items-end">
                    <div
                      className="w-full rounded-full bg-ink-black"
                      style={{ height: `${week.cents === 0 ? 0 : Math.max(8, (week.cents / peak) * 100)}%` }}
                      title={formatCurrency(week.cents)}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                {weeks.map((week) => (
                  <span key={week.label} className="flex-1 text-center text-[9px] text-muted-gray">
                    {week.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
          <p className="text-[11px] text-muted-gray">Payouts</p>
          <p className="mt-3 text-body-sm">Held {formatCurrency(held)}</p>
          <p className="mt-1 text-body-sm">Paid out {formatCurrency(transferred)}</p>
          <p className="mt-4 text-body-sm text-muted-gray">
            Shoply keeps 5% of each sale. Held payouts move after the bank account is connected.
          </p>
          <h2 className="mt-6 text-[14px]">Top products</h2>
          {top.length === 0 ? (
            <p className="mt-2 text-body-sm text-muted-gray">Nothing ranked yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {top.map((product) => (
                <li key={product.title} className="flex items-center justify-between gap-3 text-body-sm">
                  <span>
                    {product.title}
                    <span className="text-muted-gray"> · {product.units}</span>
                  </span>
                  <span>{formatCurrency(product.cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function lastEightWeeks() {
  const start = startOfWeek(new Date());
  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() - (7 - index) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return {
      start: weekStart.getTime(),
      end: weekEnd.getTime(),
      label: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cents: 0,
    };
  });
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const mondayOffset = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - mondayOffset);
  return copy;
}
