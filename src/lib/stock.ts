import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient<Database>;

export async function reserveProductStock(
  supabase: AdminClient,
  productId: string,
  quantity: number,
  expectedStock: number,
) {
  if (quantity < 1 || expectedStock < quantity) return false;
  const { data } = await supabase
    .from("products")
    .update({ stock: expectedStock - quantity })
    .eq("id", productId)
    .eq("stock", expectedStock)
    .select("id");
  return (data ?? []).length > 0;
}

export async function restoreProductStock(supabase: AdminClient, productId: string, quantity: number) {
  if (quantity < 1) return;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data } = await supabase.from("products").select("stock").eq("id", productId).maybeSingle();
    if (!data) return;
    const { data: updated } = await supabase
      .from("products")
      .update({ stock: data.stock + quantity })
      .eq("id", productId)
      .eq("stock", data.stock)
      .select("id");
    if ((updated ?? []).length > 0) return;
  }
}

export async function releaseUnpaidOrder(orderId: string, buyerId: string) {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("buyer_id", buyerId)
    .eq("status", "processing")
    .select("id");
  if (!order?.length) return;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  const totals = new Map<string, number>();
  for (const item of items ?? []) {
    if (!item.product_id) continue;
    totals.set(item.product_id, (totals.get(item.product_id) ?? 0) + item.quantity);
  }
  for (const [productId, quantity] of totals) {
    await restoreProductStock(supabase, productId, quantity);
  }
}
