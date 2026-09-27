import { HeroSlides } from "@/components/home/hero-slides";
import { ButtonLink } from "@/components/ui/button";
import type { ProductWithVendor } from "@/lib/types";

export function Hero({ products }: { products: ProductWithVendor[] }) {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pt-8 pb-16">
      <form action="/shop" className="mb-10 flex h-14 w-full max-w-xl items-center rounded-full border border-ink-black/10 bg-pure-white pr-1 pl-5">
        <input
          name="q"
          placeholder="Search products"
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] tracking-[-0.031em] text-ink-black outline-none placeholder:text-muted-gray"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-shop-violet text-pure-white shadow-lg-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      <HeroSlides products={products} />
      <div className="mt-8 flex max-w-xl flex-col items-center gap-3 text-center">
        <p className="text-[12px] text-muted-gray">Multi-vendor marketplace</p>
        <h1 className="text-[32px] leading-[1.15] tracking-[-0.05em] text-ink-black">
          Fashion and lifestyle, from independent sellers.
        </h1>
        <p className="text-[16px] leading-[1.45] text-muted-gray">
          Shoply brings boutiques, beauty labs, and streetwear labels into one shop. Buyers pay the
          listed price. Sellers keep 95%.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop" size="lg">
          Shop now
        </ButtonLink>
        <ButtonLink href="/onboarding" variant="secondary" size="lg">
          Start selling
        </ButtonLink>
      </div>
    </section>
  );
}
