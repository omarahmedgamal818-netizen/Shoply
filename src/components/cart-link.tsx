"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="text-body-sm font-bold text-ink">
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
