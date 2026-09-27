"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function AddToBag({ slug, stock, sizes = [] }: { slug: string; stock: number; sizes?: string[] }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const max = Math.max(1, Math.min(stock, 9));
  const needsSize = sizes.length > 0;

  return (
    <div className="flex flex-col items-start gap-4">
      {needsSize ? (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-muted-gray">Size</span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                onClick={() => {
                  setSize(option);
                  setAdded(false);
                }}
                className={
                  size === option
                    ? "h-10 min-w-10 rounded-full bg-ink-black px-3 text-[14px] text-pure-white"
                    : "h-10 min-w-10 rounded-full border border-faint-border bg-pure-white px-3 text-[14px] text-ink-black"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <span className="text-[14px] text-muted-gray">Quantity</span>
        <div className="flex items-center rounded-full bg-canvas-mist p-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-black"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <span className="w-6 text-center text-[14px]">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-black"
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        disabled={stock < 1 || (needsSize && !size)}
        onClick={() => {
          addItem(slug, quantity, needsSize ? size : undefined);
          setAdded(true);
        }}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-shop-violet text-[16px] tracking-[-0.031em] text-pure-white shadow-lg-2 disabled:opacity-40"
      >
        {stock < 1 ? "Out of stock" : added ? "Added to bag" : "Add to Bag"}
      </button>
      {added ? (
        <Link href="/cart" className="text-[16px] text-shop-violet">
          View cart and pay
        </Link>
      ) : null}
      <ul className="flex flex-col gap-2 text-[14px] text-muted-gray">
        <li>{stock < 1 ? "Currently unavailable" : `${stock} in stock`}</li>
        <li>Flat shipping is $5.99.</li>
        <li>Shoply keeps 5% from the seller, so your price does not go up.</li>
      </ul>
    </div>
  );
}
