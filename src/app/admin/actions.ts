"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { formFields, vendorStatusSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (data?.role !== "admin") redirect("/admin");
  return supabase;
}

export async function setVendorStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const { userId } = await auth();
  if (!userId || !consumeRateLimit(`admin-vendor:${userId}`, 30, 60 * 60_000)) return;
  const parsed = vendorStatusSchema.safeParse(formFields(formData));
  if (!parsed.success) return;
  const { id, status } = parsed.data;

  const patch: { status: "active" | "rejected" | "pending"; trust_score?: number } = { status };
  if (status === "active") {
    const { data } = await supabase.from("vendors").select("trust_score, owner_id").eq("id", id).maybeSingle();
    if (data && data.trust_score === 0) patch.trust_score = 75;
    if (data?.owner_id) {
      await supabase.from("profiles").update({ role: "vendor" }).eq("id", data.owner_id).neq("role", "admin");
    }
  }
  await supabase.from("vendors").update(patch).eq("id", id);
  revalidatePath("/admin");
}
