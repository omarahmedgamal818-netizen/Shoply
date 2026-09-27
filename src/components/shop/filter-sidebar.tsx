"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

export function FilterSidebar({
  categories,
  vendors,
  category,
  vendor,
  q,
}: {
  categories: string[];
  vendors: { slug: string; store_name: string }[];
  category?: string;
  vendor?: string;
  q?: string;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <form action="/shop" className="flex h-14 items-center rounded-full border border-ink-black/10 bg-pure-white pr-1 pl-5">
        <label className="sr-only" htmlFor="q">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="h-full min-w-0 flex-1 bg-transparent text-body-lg outline-none placeholder:text-muted-gray"
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {vendor ? <input type="hidden" name="vendor" value={vendor} /> : null}
        <button
          type="submit"
          aria-label="Search"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-shop-violet text-pure-white shadow-lg-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      <div>
        <p className="mb-3 text-[11px] text-muted-gray">Category</p>
        <ul className="flex flex-wrap gap-2">
          <FilterLink href="/shop" active={!category} label="All" />
          {categories.map((item) => (
            <FilterLink
              key={item}
              href={`/shop?category=${encodeURIComponent(item)}`}
              active={category === item}
              label={item}
            />
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-3 text-[11px] text-muted-gray">Store</p>
        <ul className="flex flex-wrap gap-2">
          {vendors.map((item) => (
            <FilterLink
              key={item.slug}
              href={`/shop?vendor=${item.slug}`}
              active={vendor === item.slug}
              label={item.store_name}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center rounded-full border border-faint-border bg-pure-white px-4 py-1.5 text-body-lg text-ink-black shadow-sm",
          active && "bg-canvas-mist",
        )}
      >
        {label}
      </Link>
    </li>
  );
}

export function SortSelect({ sort }: { sort?: SortOption }) {
  return (
    <form>
      <select
        name="sort"
        defaultValue={sort ?? "newest"}
        className="h-11 rounded-full border border-faint-border bg-pure-white px-4 text-body-lg shadow-sm"
        onChange={(event) => {
          const url = new URL(window.location.href);
          url.searchParams.set("sort", event.target.value);
          window.location.href = url.toString();
        }}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="rating">Top rated</option>
      </select>
    </form>
  );
}
