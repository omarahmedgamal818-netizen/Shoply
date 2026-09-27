import "server-only";
import { z } from "zod";

const slug = z.string().trim().regex(/^[a-z0-9-]{1,80}$/);
const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max);
const country = z.string().trim().regex(/^[A-Z]{2}$/);
const phone = z.string().trim().regex(/^[0-9+().\-\s]{6,32}$/);
const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .regex(/^https:\/\/[^\s]+$/);

export const shopFiltersSchema = z.object({
  category: z.string().trim().regex(/^[A-Za-z][A-Za-z ]{0,39}$/).optional(),
  vendor: slug.optional(),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).optional(),
});

export const cartSlugSchema = z.array(slug).max(30);

export const checkoutLineSchema = z.object({
  slug,
  quantity: z.number().int().min(1).max(10),
  size: z.string().trim().regex(/^[A-Za-z0-9]{1,8}$/).optional(),
});

export const checkoutSchema = z.array(checkoutLineSchema).min(1).max(20);

export const promoCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{4,16}$/);

export const shipmentSchema = z.object({
  id: z.string().uuid(),
  fulfillment: z.enum(["shipped", "delivered"]),
  tracking: z
    .string()
    .trim()
    .max(120)
    .regex(/^[A-Za-z0-9 .,#:/-]*$/),
});

export const stripeSessionSchema = z.string().trim().regex(/^cs_[A-Za-z0-9_]{8,180}$/);

export const vendorApplicationSchema = z.object({
  storeName: shortText(80),
  legalName: shortText(120),
  businessEmail: z.string().trim().max(160).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  phone,
  country,
  address: shortText(160),
  city: shortText(80),
  postal: shortText(20),
  description: optionalText(1000),
});

export const storeSettingsSchema = z.object({
  storeName: shortText(80),
  tagline: optionalText(140),
  description: optionalText(1000),
  phone,
  country,
  address: shortText(160),
  city: shortText(80),
  postal: shortText(20),
});

export const productSchema = z.object({
  title: shortText(120),
  description: optionalText(2000),
  category: z.string().trim().regex(/^[A-Za-z][A-Za-z ]{0,39}$/),
  price: z.string().trim().regex(/^\d{1,5}(\.\d{1,2})?$/),
  stock: z.string().trim().regex(/^\d{1,6}$/),
  imageUrl: z.union([z.literal(""), httpsUrl]),
});

export const inventoryItemSchema = z.object({
  id: z.string().uuid(),
  stock: z.string().trim().regex(/^\d{1,6}$/),
  published: z.enum(["yes", "no"]).optional(),
});

export const vendorStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "rejected", "pending"]),
});

export function formFields(formData: FormData) {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

export function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, "\\$&");
}

export function dollarsToCents(value: string) {
  return Math.round(Number(value) * 100);
}
