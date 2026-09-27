"use client";

import { ProductCard } from "@/components/product-card";
import type { ProductWithVendor } from "@/lib/types";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function CategoryRail({ products }: { products: ProductWithVendor[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setCanScroll(el.scrollWidth > el.clientWidth + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length]);

  useEffect(() => {
    if (!canScroll || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => step(1), 4000);
    return () => window.clearInterval(id);
  }, [canScroll, paused]);

  function step(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 240) + 16;
    const max = el.scrollWidth - el.clientWidth;
    const next = el.scrollLeft + direction * amount;
    if (direction > 0 && next >= max - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction < 0 && el.scrollLeft <= 4) {
      el.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} data-card className="w-[240px] shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {canScroll ? (
        <>
          <RailArrow label="Previous products" className="left-2" onClick={() => step(-1)}>
            <path d="M14 6 8 12l6 6" />
          </RailArrow>
          <RailArrow label="Next products" className="right-2" onClick={() => step(1)}>
            <path d="m10 6 6 6-6 6" />
          </RailArrow>
        </>
      ) : null}
    </div>
  );
}

function RailArrow({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-[100px] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-pure-white text-ink-black shadow-sm ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </button>
  );
}
