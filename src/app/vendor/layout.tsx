import { ShopNav } from "@/components/vendor/shop-nav";
import { StripeBadge, VendorStatusChip } from "@/components/vendor/stripe-badge";
import { getOwnedVendor } from "@/lib/vendor";

export const dynamic = "force-dynamic";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const { vendor } = await getOwnedVendor();
  if (!vendor) return children;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-gray">Shop management</p>
          <p className="text-[20px] tracking-[-0.05em] text-ink-black">{vendor.store_name}</p>
        </div>
        <div className="flex gap-2">
          <VendorStatusChip status={vendor.status} />
          <StripeBadge status={vendor.stripe_status} />
        </div>
      </div>
      <ShopNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
