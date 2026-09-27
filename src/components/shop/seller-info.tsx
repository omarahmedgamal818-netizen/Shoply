import { Stars } from "@/components/stars";
import type { VendorCard } from "@/lib/types";

export function SellerInfo({ vendor }: { vendor: VendorCard | null }) {
  if (!vendor) return null;
  return (
    <aside className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
      <p className="text-[11px] text-muted-gray">Sold by</p>
      <h2 className="mt-1 text-[16px] tracking-[-0.031em]">{vendor.store_name}</h2>
      <div className="mt-2 flex items-center gap-2 text-body-sm">
        <Stars rating={Number(vendor.rating)} />
        <span className="text-muted-gray">{vendor.review_count} reviews</span>
      </div>
      <p className="mt-3 text-body-sm text-muted-gray">Trust score {vendor.trust_score}/100</p>
    </aside>
  );
}
