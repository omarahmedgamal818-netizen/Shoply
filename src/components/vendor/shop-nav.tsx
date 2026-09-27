"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/vendor", label: "Dashboard" },
  { href: "/vendor/inventory", label: "Inventory" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/analysis", label: "Analysis" },
  { href: "/vendor/settings", label: "Settings" },
];

export function ShopNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto" aria-label="Shop management">
      {links.map((link) => {
        const active = link.href === "/vendor" ? pathname === "/vendor" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[14px] tracking-[-0.014em]",
              active ? "bg-pure-white text-ink-black shadow-sm" : "text-muted-gray",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
