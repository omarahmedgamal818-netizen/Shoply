import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { AddToBag } from "@/components/shop/add-to-bag";
import { Stars } from "@/components/stars";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.title} — Shoply` : "Product — Shoply" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const onSale = product.compare_at_cents && product.compare_at_cents > product.price_cents;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-[12px] text-muted-gray">
        <Link href="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink-black">{product.title}</span>
      </nav>
      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[28px] bg-pure-white shadow-sm-2 lg:sticky lg:top-24">
          <div className="relative aspect-square bg-canvas-mist">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-5 lg:pt-4">
          <p className="text-[12px] text-muted-gray">{product.vendors?.store_name ?? "Shoply seller"}</p>
          <h1 className="text-[32px] leading-[1.15] tracking-[-0.05em] text-ink-black">{product.title}</h1>
          <div className="flex items-center gap-3">
            <Stars rating={Number(product.rating)} />
            <span className="text-[12px] text-muted-gray">{product.review_count} reviews</span>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-[28px] tracking-[-0.05em] text-ink-black">{formatCurrency(product.price_cents)}</p>
            {onSale ? (
              <p className="text-[16px] text-muted-gray line-through">{formatCurrency(product.compare_at_cents!)}</p>
            ) : null}
          </div>
          <p className="max-w-md text-[16px] leading-[1.45] text-muted-gray">{product.description}</p>
          <AddToBag slug={product.slug} stock={product.stock} sizes={product.sizes} />
          {product.vendors ? (
            <div className="rounded-[28px] bg-pure-white p-5 shadow-sm">
              <p className="text-[12px] text-muted-gray">Sold by</p>
              <p className="mt-1 text-[16px] tracking-[-0.031em]">{product.vendors.store_name}</p>
              <p className="mt-2 text-[14px] text-muted-gray">
                Trust score {product.vendors.trust_score}/100 · {product.vendors.review_count} reviews
              </p>
            </div>
          ) : null}
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-6 text-[20px] tracking-[-0.05em]">
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>
              More in {product.category} <span aria-hidden="true">›</span>
            </Link>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
