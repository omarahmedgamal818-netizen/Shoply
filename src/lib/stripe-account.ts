import "server-only";
import { auth } from "@clerk/nextjs/server";
import { releaseHeldPayouts } from "@/lib/payouts";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncStripeAccount() {
  const { userId } = await auth();
  if (!userId) return;
  const stripe = getStripe();
  if (!stripe) return;

  const supabase = createAdminClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, stripe_account_id")
    .eq("owner_id", userId)
    .maybeSingle();
  if (!vendor?.stripe_account_id) return;

  const account = await stripe.accounts.retrieve(vendor.stripe_account_id);
  const status =
    account.charges_enabled && account.payouts_enabled
      ? "connected"
      : account.details_submitted
        ? "pending"
        : "not_connected";

  await supabase.from("vendors").update({ stripe_status: status }).eq("id", vendor.id);
  if (status === "connected") await releaseHeldPayouts(vendor.id);
}
