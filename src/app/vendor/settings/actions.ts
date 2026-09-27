"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { formFields, storeSettingsSchema } from "@/lib/schemas";
import { requireOwnedVendor } from "@/lib/vendor";

export async function updateStoreSettings(formData: FormData) {
  const { supabase, vendor } = await requireOwnedVendor();
  if (!consumeRateLimit(`settings:${vendor.id}`, 20, 60 * 60_000)) redirect("/vendor/settings?error=rate");
  const parsed = storeSettingsSchema.safeParse(formFields(formData));
  if (!parsed.success) redirect("/vendor/settings?error=missing");
  const { storeName, tagline, description, phone, country, address, city, postal } = parsed.data;

  const { error } = await supabase
    .from("vendors")
    .update({
      store_name: storeName,
      tagline: tagline || null,
      description: description || null,
      phone,
      country,
      address_line: address,
      city,
      postal_code: postal,
    })
    .eq("id", vendor.id)
    .eq("owner_id", vendor.owner_id);

  if (error) redirect("/vendor/settings?error=save");
  revalidatePath("/vendor");
  revalidatePath("/vendor/settings");
  redirect("/vendor/settings?saved=1");
}
