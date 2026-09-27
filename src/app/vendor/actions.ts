"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { formFields, vendorApplicationSchema } from "@/lib/schemas";
import { appOrigin, getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function submitVendorApplication(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (!consumeRateLimit(`vendor-apply:${userId}`, 3, 60 * 60_000)) redirect("/vendor?error=rate");
  const parsed = vendorApplicationSchema.safeParse(formFields(formData));
  if (!parsed.success) redirect("/vendor?error=missing");
  const { storeName, legalName, businessEmail, phone, country, address, city, postal, description } = parsed.data;

  const user = await currentUser();
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  await supabase.from("profiles").upsert({
    id: userId,
    email: businessEmail,
    full_name: user?.fullName ?? legalName,
    role: existing?.role === "admin" ? "admin" : "vendor",
  });

  const { error } = await supabase.from("vendors").insert({
    owner_id: userId,
    store_name: storeName,
    slug: `${slugify(storeName)}-${userId.slice(-6).toLowerCase()}`,
    description,
    status: "pending",
    trust_score: 0,
    stripe_status: "not_connected",
    legal_name: legalName,
    phone,
    country,
    address_line: address,
    city,
    postal_code: postal,
  });

  if (error) redirect("/vendor?error=save");
  redirect("/vendor");
}

export async function startStripeConnect() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!consumeRateLimit(`stripe-connect:${userId}`, 5, 60 * 60_000)) redirect("/vendor?error=rate");

  const stripe = getStripe();
  if (!stripe) redirect("/vendor?error=stripe");

  const supabase = createAdminClient();
  const { data: vendor } = await supabase.from("vendors").select("*").eq("owner_id", userId).maybeSingle();
  if (!vendor) redirect("/vendor");

  let accountId = vendor.stripe_account_id;
  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: vendor.country || "US",
        email: undefined,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_profile: { name: vendor.store_name },
      });
      accountId = account.id;
      await supabase.from("vendors").update({ stripe_account_id: accountId, stripe_status: "pending" }).eq("id", vendor.id);
    } catch {
      redirect("/vendor?error=stripe");
    }
  }

  if (!accountId) redirect("/vendor?error=stripe");
  const origin = await appOrigin(await headers());
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/vendor?stripe=refresh`,
    return_url: `${origin}/vendor?stripe=return`,
    type: "account_onboarding",
  });
  redirect(link.url);
}
