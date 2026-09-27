import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { startStripeConnect } from "@/app/vendor/actions";
import { syncStripeAccount } from "@/lib/stripe-account";
import { BusinessApplication } from "@/components/vendor/business-application";
import { Stat } from "@/components/vendor/stat";
import { TrustScore } from "@/components/vendor/trust-score";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import { getOwnedVendor, getVendorOrderLines } from "@/lib/vendor";

export const dynamic = "force-dynamic";

export default async function VendorPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string; error?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
        <h1 className="text-headline">Vendor hub</h1>
        <p className="mt-3 text-body-lg text-muted-gray">Sign in, then open shop management.</p>
        <Link href="/sign-in" className="mt-6 inline-flex text-body-lg text-ink-black">
          Sign in
        </Link>
      </div>
    );
  }

  const params = await searchParams;
  if (params.stripe === "return" || params.stripe === "refresh") {
    await syncStripeAccount();
  }

  const { vendor } = await getOwnedVendor();
  const user = await currentUser();

  if (!vendor) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-12">
        <h1 className="text-headline">Become a vendor</h1>
        {params.error === "missing" ? (
          <p className="mt-3 text-body-sm text-ink-black">Fill in every business field before continuing.</p>
        ) : null}
        {params.error === "save" ? (
          <p className="mt-3 text-body-sm text-ink-black">The application could not be saved. Try a different store name.</p>
        ) : null}
        {params.error === "rate" ? (
          <p className="mt-3 text-body-sm text-ink-black">Too many attempts. Wait a while and try again.</p>
        ) : null}
        <div className="mt-6">
          <BusinessApplication email={user?.primaryEmailAddress?.emailAddress} />
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();
  const [{ count: productCount }, { data: stockRows }, lines] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("products").select("stock").eq("vendor_id", vendor.id),
    getVendorOrderLines(vendor.id),
  ]);

  const units = (stockRows ?? []).reduce((sum, row) => sum + Number(row.stock), 0);
  const sales = lines.reduce((sum, line) => sum + line.unit_price_cents * line.quantity, 0);
  const payouts = lines.reduce((sum, line) => sum + line.payout_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline">Dashboard</h1>
        <p className="mt-2 text-body text-muted-gray">{vendor.legal_name}</p>
      </div>
      {params.error === "stripe" ? (
        <p className="text-body-sm text-ink-black">
          Stripe could not start onboarding. In test mode, use US, GB, or DE if your country is unsupported, and enable Connect in the Stripe Dashboard.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={String(productCount ?? 0)} hint="In your catalog" />
        <Stat label="Units on hand" value={String(units)} />
        <Stat label="Sales" value={formatCurrency(sales)} hint={`${lines.length} line${lines.length === 1 ? "" : "s"}`} />
        <Stat label="Your payouts" value={formatCurrency(payouts)} hint="After Shoply's 5%" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrustScore score={vendor.trust_score} notes={vendor.ai_scan_notes} />
        <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
          <p className="text-[11px] text-muted-gray">Recent orders</p>
          {lines.length === 0 ? (
            <p className="mt-3 text-body-sm text-muted-gray">Orders appear here after a buyer pays.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {lines.slice(0, 4).map((line) => (
                <li key={line.id} className="flex items-center justify-between gap-3 text-body-sm">
                  <span>
                    {line.title}
                    <span className="text-muted-gray"> · {line.order_number}</span>
                  </span>
                  <span>{formatCurrency(line.payout_cents)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/vendor/orders" className="mt-4 inline-flex text-body-sm text-ink-black">
            All orders
          </Link>
        </div>
      </div>
      {vendor.stripe_status !== "connected" ? (
        <form action={startStripeConnect}>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-shop-violet px-8 text-body-lg text-pure-white shadow-lg-2"
          >
            Connect bank account with Stripe
          </button>
        </form>
      ) : (
        <p className="text-body-lg text-muted-gray">Payouts go to your connected bank. Shoply keeps a 5% commission.</p>
      )}
    </div>
  );
}
