import "server-only";
import { cartSlugSchema, escapeIlike, shopFiltersSchema } from "@/lib/schemas";
import { createPublicClient } from "@/lib/supabase/public";
import type { ProductWithVendor, Vendor, VendorCard } from "@/lib/types";

const vendorFields =
  "id, store_name, slug, rating, review_count, trust_score, status, stripe_status";

const productSelect = `id, vendor_id, title, slug, description, category, price_cents, compare_at_cents, image_url, sizes, stock, rating, review_count, is_featured, is_published, vendors!inner(${vendorFields})`;

type ProductQueryRow = ProductWithVendor & {
  vendors: VendorCard | VendorCard[] | null;
};

function vendorCard(value: VendorCard | VendorCard[] | null): VendorCard | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function asProducts(rows: ProductQueryRow[]): ProductWithVendor[] {
  return rows.map((row) => ({
    ...row,
    sizes: row.sizes,
    vendors: vendorCard(row.vendors),
  }));
}

export type ShopFilters = {
  category?: string;
  vendor?: string;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
};

export async function getFeaturedProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_published", true)
    .eq("vendors.status", "active")
    .eq("is_featured", true)
    .limit(6);
  if (error) throw new Error("Could not load products.");
  return asProducts(data ?? []);
}

export async function getActivePromotion() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, subtitle, discount_percent, code, ends_at, is_active")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not load the promotion.");
  return data;
}

export async function getPromotionByCode(code: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, subtitle, discount_percent, code, ends_at, is_active")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error("Could not load the promotion.");
  return data;
}

export async function getProducts(filters: ShopFilters = {}) {
  const parsed = shopFiltersSchema.safeParse(filters);
  const safe = parsed.success ? parsed.data : {};
  const supabase = createPublicClient();
  let query = supabase.from("products").select(productSelect).eq("is_published", true).eq("vendors.status", "active");

  if (safe.category) query = query.eq("category", safe.category);
  if (safe.q) query = query.ilike("title", `%${escapeIlike(safe.q)}%`);

  if (safe.sort === "price-asc") query = query.order("price_cents", { ascending: true });
  else if (safe.sort === "price-desc") query = query.order("price_cents", { ascending: false });
  else if (safe.sort === "rating") query = query.order("rating", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error("Could not load products.");

  let products = asProducts(data ?? []);
  if (safe.vendor) {
    products = products.filter((product) => product.vendors?.slug === safe.vendor);
  }
  return products;
}

export async function getProductBySlug(slug: string) {
  const parsed = cartSlugSchema.safeParse([slug]);
  if (!parsed.success) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("vendors.status", "active")
    .maybeSingle();
  if (error) throw new Error("Could not load the product.");
  return data ? asProducts([data])[0] : null;
}

export async function getProductsBySlugs(slugs: string[]) {
  const parsed = cartSlugSchema.safeParse(slugs);
  if (!parsed.success || parsed.data.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .in("slug", parsed.data)
    .eq("is_published", true)
    .eq("vendors.status", "active");
  if (error) throw new Error("Could not load products.");
  return asProducts(data ?? []);
}

export async function getCategories() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("category, vendors!inner(status)")
    .eq("is_published", true)
    .eq("vendors.status", "active");
  if (error) throw new Error("Could not load categories.");
  return [...new Set((data ?? []).map((row) => row.category))].sort();
}

export async function getActiveVendors() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, store_name, slug, status")
    .eq("status", "active")
    .order("store_name");
  if (error) throw new Error("Could not load sellers.");
  return data ?? [];
}

export async function getRelatedProducts(product: ProductWithVendor) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_published", true)
    .eq("vendors.status", "active")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4);
  if (error) throw new Error("Could not load products.");
  return asProducts(data ?? []);
}

export async function getVendorByOwner(ownerId: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw new Error("Could not load the seller.");
  return data satisfies Vendor | null;
}
