import { CategoryRail } from "@/components/home/category-rail";
import { CountdownBanner } from "@/components/home/countdown-banner";
import { Hero } from "@/components/home/hero";
import { ProductCard } from "@/components/product-card";
import { getActivePromotion, getFeaturedProducts, getProducts } from "@/lib/queries";
import type { ProductWithVendor } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const HERO_SLIDE_COUNT = 12;

function heroSlides(featured: ProductWithVendor[], products: ProductWithVendor[]) {
  const seen = new Set(featured.map((product) => product.id));
  const extras = products.filter((product) => product.image_url && !seen.has(product.id));
  const byCategory = new Map<string, ProductWithVendor[]>();
  for (const product of extras) {
    const queue = byCategory.get(product.category) ?? [];
    queue.push(product);
    byCategory.set(product.category, queue);
  }

  const picked: ProductWithVendor[] = [];
  const queues = [...byCategory.values()];
  const room = Math.max(HERO_SLIDE_COUNT - featured.length, 0);
  while (picked.length < room && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (!next) continue;
      picked.push(next);
      if (picked.length >= room) break;
    }
  }

  const slides = [...featured.filter((product) => product.image_url), ...picked];
  return slides.length > 0 ? slides : products.slice(0, HERO_SLIDE_COUNT);
}

export default async function HomePage() {
  const [featured, products, promotion] = await Promise.all([
    getFeaturedProducts(),
    getProducts(),
    getActivePromotion(),
  ]);

  const categories = [...new Set(products.map((product) => product.category))];

  return (
    <>
      <Hero products={heroSlides(featured, products)} />
      {promotion ? (
        <CountdownBanner
          title={promotion.title}
          subtitle={promotion.subtitle}
          code={promotion.code}
          discountPercent={promotion.discount_percent}
          endsAt={promotion.ends_at}
        />
      ) : null}
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-16">
        <h2 className="mb-6 text-[20px] tracking-[-0.05em]">
          <Link href="/shop">
            Featured this week <span aria-hidden="true">›</span>
          </Link>
        </h2>
        <p className="mb-6 max-w-2xl text-[16px] text-muted-gray">
          A glass-framed look at what independent sellers just dropped.
        </p>
        <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      {categories.map((category) => {
        const items = products.filter((product) => product.category === category);
        return (
          <section key={category} className="mx-auto w-full max-w-[1200px] px-4 pb-16">
            <h2 className="mb-6 text-[20px] tracking-[-0.05em]">
              <Link href={`/shop?category=${encodeURIComponent(category)}`}>
                {category} <span aria-hidden="true">›</span>
              </Link>
            </h2>
            <CategoryRail products={items} />
          </section>
        );
      })}
    </>
  );
}
