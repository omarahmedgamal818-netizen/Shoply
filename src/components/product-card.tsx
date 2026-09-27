import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithVendor } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithVendor }) {
  const onSale = product.compare_at_cents && product.compare_at_cents > product.price_cents;
  return (
    <article>
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-pure-white shadow-sm-2">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
          {onSale ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-pure-white/90 px-3 py-1 text-[12px] text-ink-black">
              Sale
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 px-1 pt-4">
          <p className="text-[12px] text-muted-gray">{product.vendors?.store_name ?? "Shoply seller"}</p>
          <h3 className="text-[16px] tracking-[-0.031em] text-ink-black">{product.title}</h3>
          <p className="text-[14px] text-ink-black">
            {formatCurrency(product.price_cents)}
            {onSale ? (
              <span className="ml-2 text-muted-gray line-through">
                {formatCurrency(product.compare_at_cents!)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
