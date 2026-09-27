"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { formFields, shipmentSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnedVendor } from "@/lib/vendor";

function parentOrder(value: { status: string } | { status: string }[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function updateShipment(formData: FormData) {
  const { vendor } = await requireOwnedVendor();
  if (!consumeRateLimit(`ship:${vendor.id}`, 30, 60_000)) redirect("/vendor/orders?error=rate");
  const parsed = shipmentSchema.safeParse(formFields(formData));
  if (!parsed.success) redirect("/vendor/orders?error=save");

  const supabase = createAdminClient();
  const { data: item } = await supabase
    .from("order_items")
    .select("id, vendor_id, order_id, orders(status)")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const order = item ? parentOrder(item.orders) : null;
  if (!item || item.vendor_id !== vendor.id || !item.order_id || !order) redirect("/vendor/orders?error=save");
  if (order.status !== "paid" && order.status !== "shipped" && order.status !== "delivered") {
    redirect("/vendor/orders?error=unpaid");
  }

  const { error } = await supabase
    .from("order_items")
    .update({
      fulfillment_status: parsed.data.fulfillment,
      tracking_note: parsed.data.tracking || null,
    })
    .eq("id", item.id)
    .eq("vendor_id", vendor.id);
  if (error) redirect("/vendor/orders?error=save");

  const { data: siblings } = await supabase
    .from("order_items")
    .select("fulfillment_status")
    .eq("order_id", item.order_id);
  const statuses = (siblings ?? []).map((row) => row.fulfillment_status);
  const next =
    statuses.length > 0 && statuses.every((status) => status === "delivered")
      ? "delivered"
      : statuses.length > 0 && statuses.every((status) => status === "shipped" || status === "delivered")
        ? "shipped"
        : "paid";
  await supabase.from("orders").update({ status: next }).eq("id", item.order_id);
  revalidatePath("/vendor/orders");
  revalidatePath("/orders");
  redirect("/vendor/orders?saved=1");
}
