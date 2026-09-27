"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { loadCartProducts, startStripeCheckout } from "@/app/cart/actions";
import { cartLineKey, useCart } from "@/lib/cart";
import { discountedUnitCents, lineFeeCents } from "@/lib/pricing";
import { SHIPPING_FLAT_CENTS, type ProductWithVendor } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CartView({
  notice,
  promotion,
}: {
  notice?: string;
  promotion: { code: string; discountPercent: number } | null;
}) {
  const { lines, setQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<ProductWithVendor[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    loadCartProducts(lines.map((line) => line.slug)).then((rows) => {
      if (active) setProducts(rows);
    });
    return () => {
      active = false;
    };
  }, [lines]);

  const rows = lines
    .map((line) => {
      const product = products.find((item) => item.slug === line.slug);
      return product ? { line, product } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const codeMatches = promotion !== null && promoCode.trim().toUpperCase() === promotion.code.toUpperCase();
  const discountPercent = codeMatches ? promotion.discountPercent : 0;
  const subtotal = rows.reduce((sum, row) => sum + row.product.price_cents * row.line.quantity, 0);
  const discount = rows.reduce((sum, row) => {
    const unit = discountedUnitCents(row.product.price_cents, row.product.is_featured, discountPercent);
    return sum + (row.product.price_cents - unit) * row.line.quantity;
  }, 0);
  const commission = rows.reduce((sum, row) => {
    const unit = discountedUnitCents(row.product.price_cents, row.product.is_featured, discountPercent);
    return sum + lineFeeCents(unit, row.line.quantity);
  }, 0);

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="text-headline">Your bag</h1>
        {notice ? <p className="mt-3 text-body-sm text-ink-black">{notice}</p> : null}
        {lines.length === 0 ? (
          <p className="mt-6 text-body-lg text-muted-gray">Your bag is empty. Shop the marketplace to add something.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {rows.map(({ line, product }) => (
              <li key={cartLineKey(line)} className="flex gap-4 rounded-[28px] bg-pure-white p-3 shadow-sm-2">
                <div className="relative h-24 w-24 overflow-hidden rounded-[20px] bg-canvas-mist">
                  {product.image_url ? (
                    <Image src={product.image_url} alt="" fill className="object-cover" sizes="80px" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-[14px]">{product.title}</p>
                  {line.size ? <p className="text-body-sm text-muted-gray">Size {line.size}</p> : null}
                  <p className="text-body-sm text-muted-gray">{product.vendors?.store_name}</p>
                  <p className="mt-1 text-body">{formatCurrency(product.price_cents)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(event) => setQuantity(product.slug, Number(event.target.value), line.size)}
                      className="h-9 w-16 rounded-full border border-faint-border bg-pure-white px-3 text-center"
                    />
                    <button type="button" onClick={() => removeItem(product.slug, line.size)} className="text-body-sm text-muted-gray">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside className="h-fit rounded-[28px] bg-pure-white p-6 shadow-sm-2">
        <h2 className="text-subhead">Checkout</h2>
        <dl className="mt-4 flex flex-col gap-2 text-body-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between">
              <dt>Promo {promotion?.code}</dt>
              <dd>−{formatCurrency(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{formatCurrency(SHIPPING_FLAT_CENTS)}</dd>
          </div>
          <div className="flex justify-between text-muted-gray">
            <dt>Seller commission (5%)</dt>
            <dd>{formatCurrency(commission)} from the seller</dd>
          </div>
          <div className="mt-2 flex justify-between text-body font-bold">
            <dt>You pay</dt>
            <dd>{formatCurrency(subtotal - discount + SHIPPING_FLAT_CENTS)}</dd>
          </div>
        </dl>
        <label className="mt-5 block text-body-sm text-muted-gray">
          Promo code
          <input
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder={promotion ? promotion.code : "Code"}
            autoComplete="off"
            className="mt-2 h-11 w-full rounded-full border border-faint-border bg-pure-white px-4 text-body text-ink-black outline-none"
          />
        </label>
        {promotion ? (
          <p className="mt-2 text-[12px] text-muted-gray">{promotion.discountPercent}% off featured products.</p>
        ) : null}
        <button
          type="button"
          disabled={rows.length === 0 || pending}
          onClick={() =>
            startTransition(() => {
              startStripeCheckout(
                rows.map((row) => ({ slug: row.product.slug, quantity: row.line.quantity, size: row.line.size })),
                promoCode,
              );
            })
          }
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-shop-violet text-body-lg text-pure-white shadow-lg-2 disabled:opacity-40"
        >
          {pending ? "Opening Stripe…" : "Pay with Stripe"}
        </button>
      </aside>
    </div>
  );
}
