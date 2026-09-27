import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RoleChooser } from "@/components/onboarding/role-chooser";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
        <h1 className="text-headline">How do you want to use Shoply?</h1>
        <p className="mt-3 text-body-lg text-muted-gray">Sign up as a buyer, or start a vendor application.</p>
        <div className="mt-8">
          <RoleChooser />
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: vendor } = await supabase.from("vendors").select("id").eq("owner_id", userId).maybeSingle();
  if (vendor) redirect("/vendor");

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
      <h1 className="text-headline">Choose your role</h1>
      <div className="mt-8">
        <RoleChooser />
      </div>
    </div>
  );
}
