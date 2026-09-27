import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PayoutStatus, Vendor } from "@/lib/types";

export async function getOwnedVendor(): Promise<{ userId: string | null; vendor: Vendor | null }> {
  const { userId } = await auth();
  if (!userId) return { userId: null, vendor: null };
  const supabase = createAdminClient();
  const { data } = await supabase.from("vendors").select("*").eq("owner_id", userId).maybeSingle();
  return { userId, vendor: data };
}

export async function requireOwnedVendor() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();
  const { data } = await supabase.from("vendors").select("*").eq("owner_id", userId).maybeSingle();
  if (!data) redirect("/vendor");
  return { supabase, vendor: data, userId };
}

export type VendorOrderLine = {
  id: string;
  title: string;
  image_url: string | null;
  quantity: number;
  unit_price_cents: number;
  payout_cents: number;
  payout_status: PayoutStatus;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  fulfillment_status: "processing" | "shipped" | "delivered";
  tracking_note: string | null;
};

export async function getVendorOrderLines(vendorId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id, title, image_url, quantity, unit_price_cents, payout_cents, payout_status, fulfillment_status, tracking_note, orders(order_number, status, created_at)",
    )
    .eq("vendor_id", vendorId);

  if (error) throw new Error("Could not load orders.");

  return (data ?? [])
    .map((row) => {
      const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
      const line: VendorOrderLine = {
        id: row.id,
        title: row.title,
        image_url: row.image_url,
        quantity: row.quantity,
        unit_price_cents: row.unit_price_cents,
        payout_cents: row.payout_cents,
        payout_status: row.payout_status,
        order_number: order?.order_number ?? "Order",
        status: order?.status ?? "processing",
        created_at: order?.created_at ?? "",
        fulfillment_status: row.fulfillment_status,
        tracking_note: row.tracking_note,
      };
      return line;
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
