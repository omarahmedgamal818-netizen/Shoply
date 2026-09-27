"use client";

import { formatCurrency } from "@/lib/utils";
import type { ProductWithVendor } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const INTERVAL_MS = 5000;

export function HeroSlides({ products }: { products: ProductWithVendor[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) {
    return (
      <div className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-[28px] bg-pure-white shadow-sm-2">
        <Image
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&h=1400&q=80"
          alt="Featured Shoply look"
          fill
          priority
          sizes="900px"
          className="object-cover"
        />
      </div>
    );
  }

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div
      className="w-full max-w-3xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-pure-white shadow-sm-2">
        <div
          className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(-${(index * 100) / count}%)`,
          }}
        >
          {products.map((product, slideIndex) => {
            const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
            return (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="relative block h-full"
                style={{ width: `${100 / count}%` }}
                aria-hidden={slideIndex !== index}
                tabIndex={slideIndex === index ? 0 : -1}
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    priority={slideIndex === 0}
                    sizes="900px"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-6 pt-16 pb-6 text-pure-white">
                  <p className="text-[12px] text-white/80">{product.vendors?.store_name ?? "Shoply seller"}</p>
                  <p className="mt-1 text-[20px] tracking-[-0.05em]">{product.title}</p>
                  <p className="mt-1 text-[14px]">
                    {formatCurrency(product.price_cents)}
                    {onSale ? (
                      <span className="ml-2 text-white/70 line-through">
                        {formatCurrency(product.compare_at_cents!)}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        {count > 1 ? (
          <>
            <SlideButton label="Previous slide" className="left-3" onClick={() => go(index - 1)}>
              <path d="M14 6 8 12l6 6" />
            </SlideButton>
            <SlideButton label="Next slide" className="right-3" onClick={() => go(index + 1)}>
              <path d="m10 6 6 6-6 6" />
            </SlideButton>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {products.map((product, slideIndex) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show ${product.title}`}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => go(slideIndex)}
              className={
                slideIndex === index
                  ? "h-2 w-6 rounded-full bg-shop-violet"
                  : "h-2 w-2 rounded-full bg-cool-stone"
              }
            />
          ))}
        </div>
      ) : null}
      {count > 1 && !paused ? (
        <div className="mx-auto mt-3 h-0.5 w-24 overflow-hidden rounded-full bg-cool-stone/70">
          <div
            key={index}
            className="h-full origin-left bg-shop-violet motion-reduce:hidden"
            style={{ animation: `shoply-slide-progress ${INTERVAL_MS}ms linear forwards` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function SlideButton({
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
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-pure-white text-ink-black shadow-sm ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </button>
  );
}
