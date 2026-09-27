"use client";

import { Show, SignInButton, SignOutButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/vendor", label: "Vendor Hub" },
  { href: "/orders", label: "Orders" },
  { href: "/admin", label: "Admin" },
  { href: "/cart", label: "Cart" },
];

export function SiteRail() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <aside className="fixed top-0 left-0 z-30 hidden h-full w-16 flex-col items-center gap-2 bg-pure-white py-4 md:flex">
      <Link href="/" aria-label="Shoply" className="mb-4">
        {/* Plain img keeps the transparent cart mark from being matted by the image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shoply-mark.png" alt="" className="h-8 w-auto" />
      </Link>
      <nav className="flex flex-1 flex-col items-center gap-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={link.label}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-[20px] text-ink-black",
                active && "bg-canvas-mist",
              )}
            >
              <RailIcon name={link.label} />
              {link.href === "/cart" && count > 0 ? (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-black px-1 text-[9px] text-pure-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <AccountControls className="mt-auto" />
    </aside>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-canvas-mist/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center justify-center px-4">
        <Link href="/" className="flex items-center">
          {/* Plain img keeps the transparent wordmark sitting on the gray header. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/shoply-wordmark.png" alt="Shoply" className="h-9 w-auto" />
        </Link>
      </div>
      <MobileLinks />
      <AccountControls className="fixed bottom-3 left-3 z-30 rounded-[20px] bg-pure-white p-1 md:hidden" />
    </header>
  );
}

function AccountControls({ className }: { className?: string }) {
  const { openUserProfile } = useClerk();

  return (
    <div className={cn("flex flex-col items-center gap-1 pb-2", className)}>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className={accountClass} title="Sign in" aria-label="Sign in">
            <AccountIcon name="sign-in" />
            <span>Sign in</span>
          </button>
        </SignInButton>
        <Link href="/onboarding" className={accountClass} title="Sign up" aria-label="Sign up">
          <AccountIcon name="sign-up" />
          <span>Sign up</span>
        </Link>
      </Show>
      <Show when="signed-in">
        <button
          type="button"
          className={accountClass}
          title="Profile settings"
          aria-label="Profile settings"
          onClick={() => openUserProfile()}
        >
          <AccountIcon name="profile" />
          <span>Profile</span>
        </button>
        <SignOutButton>
          <button type="button" className={accountClass} title="Sign out" aria-label="Sign out">
            <AccountIcon name="sign-out" />
            <span>Sign out</span>
          </button>
        </SignOutButton>
      </Show>
    </div>
  );
}

const accountClass =
  "flex w-14 flex-col items-center gap-0.5 rounded-[16px] px-1 py-1.5 text-[9px] leading-none tracking-tight text-ink-black hover:bg-canvas-mist";

function MobileLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-3 overflow-auto px-4 pb-3 md:hidden">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-body-sm whitespace-nowrap text-muted-gray",
            (pathname === link.href || pathname.startsWith(`${link.href}/`)) && "text-ink-black",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function RailIcon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  if (name === "Shop") {
    return (
      <svg {...common}>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  if (name === "Vendor Hub") {
    return (
      <svg {...common}>
        <path d="M4 10h16v10H4V10Z" />
        <path d="M3 10 6 4h12l3 6" />
      </svg>
    );
  }
  if (name === "Orders") {
    return (
      <svg {...common}>
        <path d="M7 4h10v16H7V4Z" />
        <path d="M9 8h6M9 12h6" />
      </svg>
    );
  }
  if (name === "Admin") {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 7h14l-1.2 8H8L6 7Z" />
      <path d="M6 7 5 4H3" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}

function AccountIcon({ name }: { name: "sign-in" | "sign-up" | "profile" | "sign-out" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  if (name === "sign-in") {
    return (
      <svg {...common}>
        <path d="M10 7V5H5v14h5v-2" />
        <path d="M10 12h9" />
        <path d="m16 9 3 3-3 3" />
      </svg>
    );
  }
  if (name === "sign-up") {
    return (
      <svg {...common}>
        <circle cx="10" cy="8" r="3" />
        <path d="M4 19c.6-3 2.8-4.5 6-4.5" />
        <path d="M17 11v6M14 14h6" />
      </svg>
    );
  }
  if (name === "profile") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 19c.8-3 3.2-4.5 7-4.5s6.2 1.5 7 4.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14 7V5h5v14h-5v-2" />
      <path d="M14 12H5" />
      <path d="m8 9-3 3 3 3" />
    </svg>
  );
}
