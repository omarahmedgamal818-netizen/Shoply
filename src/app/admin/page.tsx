import { auth } from "@clerk/nextjs/server";
import { setVendorStatus } from "@/app/admin/actions";
import { StripeBadge, VendorStatusChip } from "@/components/vendor/stripe-badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
        <h1 className="text-headline">Admin</h1>
        <p className="mt-3 text-body">Sign in to open the vendor approval center.</p>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
        <h1 className="text-headline">Admin</h1>
        <p className="mt-3 text-body-lg text-muted-gray">This account does not have admin access.</p>
      </div>
    );
  }

  const [{ data: vendors }, { data: orders }] = await Promise.all([
    supabase.from("vendors").select("id, store_name, status, trust_score, stripe_status, legal_name").order("created_at", { ascending: false }),
    supabase.from("orders").select("total_cents, platform_fee_cents, status"),
  ]);

  const paid = (orders ?? []).filter((order) => order.status === "paid");
  const gmv = paid.reduce((sum, order) => sum + order.total_cents, 0);
  const fees = paid.reduce((sum, order) => sum + order.platform_fee_cents, 0);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
      <h1 className="text-headline">Vendor approval</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
          <p className="text-[11px] text-muted-gray">GMV</p>
          <p className="text-subhead">{formatCurrency(gmv)}</p>
        </div>
        <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
          <p className="text-[11px] text-muted-gray">Platform fees</p>
          <p className="text-subhead">{formatCurrency(fees)}</p>
        </div>
      </div>
      <ul className="mt-8 flex flex-col gap-4">
        {(vendors ?? []).map((vendor) => (
          <li key={vendor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-pure-white p-5 shadow-sm-2">
            <div>
              <p className="text-[14px]">{vendor.store_name}</p>
              <p className="text-body-sm text-muted-gray">{vendor.legal_name}</p>
              <p className="text-[11px] text-muted-gray">Trust {vendor.trust_score}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <VendorStatusChip status={vendor.status} />
              <StripeBadge status={vendor.stripe_status} />
              <form action={setVendorStatus}>
                <input type="hidden" name="id" value={vendor.id} />
                <input type="hidden" name="status" value="active" />
                <button className="h-[34px] rounded-full bg-shop-violet px-4 text-body-sm text-pure-white shadow-lg-2">Approve</button>
              </form>
              <form action={setVendorStatus}>
                <input type="hidden" name="id" value={vendor.id} />
                <input type="hidden" name="status" value="rejected" />
                <button className="h-[34px] rounded-full border border-faint-border bg-pure-white px-4 text-body-sm text-ink-black shadow-sm">Reject</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
