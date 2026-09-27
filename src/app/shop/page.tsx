import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar, SortSelect, type SortOption } from "@/components/shop/filter-sidebar";
import { getActiveVendors, getCategories, getProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop — Shoply",
  description: "Browse products from independent Shoply sellers.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; vendor?: string; q?: string; sort?: SortOption }>;
}) {
  const filters = await searchParams;
  const [products, categories, vendors] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getActiveVendors(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10">
      <FilterSidebar
        categories={categories}
        vendors={vendors}
        category={filters.category}
        vendor={filters.vendor}
        q={filters.q}
      />
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-[20px] tracking-[-0.05em]">
              Shop <span aria-hidden="true">›</span>
            </h1>
            <p className="mt-1 text-body-sm text-muted-gray">{products.length} products</p>
          </div>
          <SortSelect sort={filters.sort} />
        </div>
        {products.length === 0 ? (
          <p className="text-[16px] text-muted-gray">No products match this search.</p>
        ) : (
          <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
