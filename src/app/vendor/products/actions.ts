"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { dollarsToCents, formFields, inventoryItemSchema, productSchema } from "@/lib/schemas";
import { requireOwnedVendor } from "@/lib/vendor";

async function ownedVendor() {
  const { supabase, vendor } = await requireOwnedVendor();
  return { supabase, vendor };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function saveProduct(formData: FormData) {
  const { supabase, vendor } = await ownedVendor();
  if (vendor.status !== "active") redirect("/vendor/inventory?error=approval");
  if (!consumeRateLimit(`product:${vendor.id}`, 20, 60 * 60_000)) redirect("/vendor/inventory?error=rate");
  const parsed = productSchema.safeParse(formFields(formData));
  if (!parsed.success) redirect("/vendor/inventory?error=invalid");
  const { title, category, description, imageUrl } = parsed.data;
  const price = dollarsToCents(parsed.data.price);
  const stock = Number(parsed.data.stock);
  const sizes =
    category === "Footwear"
      ? ["6", "7", "8", "9", "10", "11", "12"]
      : ["Tops", "Bottoms", "Outerwear"].includes(category)
        ? ["XS", "S", "M", "L", "XL"]
        : [];
  if (price <= 0 || price > 1_000_000) redirect("/vendor/inventory?error=invalid");

  const { error } = await supabase.from("products").insert({
    vendor_id: vendor.id,
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    description,
    category,
    price_cents: price,
    image_url: imageUrl || `https://picsum.photos/seed/${slugify(title)}/900/1125`,
    stock,
    sizes,
    is_published: true,
    is_featured: false,
  });
  if (error) redirect("/vendor/inventory?error=save");
  revalidatePath("/vendor/inventory");
  revalidatePath("/vendor");
  revalidatePath("/shop");
  redirect("/vendor/inventory");
}

export async function updateInventoryItem(formData: FormData) {
  const { supabase, vendor } = await ownedVendor();
  if (!consumeRateLimit(`inventory:${vendor.id}`, 30, 60_000)) redirect("/vendor/inventory?error=rate");
  const parsed = inventoryItemSchema.safeParse(formFields(formData));
  if (!parsed.success) redirect("/vendor/inventory?error=save");
  if (parsed.data.published === "yes" && vendor.status !== "active") redirect("/vendor/inventory?error=approval");
  const { id } = parsed.data;
  const stock = Number(parsed.data.stock);
  const published = parsed.data.published === "yes";
  const { data: product } = await supabase.from("products").select("id, vendor_id").eq("id", id).maybeSingle();
  if (!product || product.vendor_id !== vendor.id) redirect("/vendor/inventory?error=save");

  const { error } = await supabase
    .from("products")
    .update({
      stock,
      is_published: published,
    })
    .eq("id", id)
    .eq("vendor_id", vendor.id);

  if (error) redirect("/vendor/inventory?error=save");
  revalidatePath("/vendor/inventory");
  revalidatePath("/shop");
  redirect("/vendor/inventory");
}
