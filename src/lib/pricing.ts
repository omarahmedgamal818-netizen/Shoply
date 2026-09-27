import { PLATFORM_FEE_RATE } from "@/lib/types";

export function discountedUnitCents(priceCents: number, featured: boolean, discountPercent: number) {
  if (!featured || discountPercent <= 0) return priceCents;
  return Math.round((priceCents * (100 - discountPercent)) / 100);
}

export function linePayoutCents(unitCents: number, quantity: number) {
  return Math.round(unitCents * quantity * (1 - PLATFORM_FEE_RATE));
}

export function lineFeeCents(unitCents: number, quantity: number) {
  return Math.round(unitCents * quantity * PLATFORM_FEE_RATE);
}
