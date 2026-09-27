"use client";

import { SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function RoleChooser() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (isSignedIn) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push("/shop")}
          className="rounded-[28px] bg-pure-white p-6 text-left shadow-sm-2"
        >
          <p className="text-[11px] text-muted-gray">Buyer</p>
          <h2 className="mt-2 text-subhead">Shop the marketplace</h2>
          <p className="mt-2 text-body-sm text-muted-gray">Browse independent sellers and check out with Stripe.</p>
        </button>
        <button
          type="button"
          onClick={() => router.push("/vendor")}
          className="rounded-[28px] bg-pure-white p-6 text-left shadow-sm-2"
        >
          <p className="text-[11px] text-muted-gray">Vendor</p>
          <h2 className="mt-2 text-subhead">Become a vendor</h2>
          <p className="mt-2 text-body-sm text-muted-gray">
            Enter your business details, then connect a bank account. You keep 95%.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SignUpButton mode="modal" forceRedirectUrl="/shop">
        <button type="button" className="rounded-[28px] bg-pure-white p-6 text-left shadow-sm-2">
          <p className="text-[11px] text-muted-gray">Buyer</p>
          <h2 className="mt-2 text-subhead">Create a buyer account</h2>
        </button>
      </SignUpButton>
      <SignUpButton mode="modal" forceRedirectUrl="/vendor">
        <button type="button" className="rounded-[28px] bg-pure-white p-6 text-left shadow-sm-2">
          <p className="text-[11px] text-muted-gray">Vendor</p>
          <h2 className="mt-2 text-subhead">Create a vendor account</h2>
        </button>
      </SignUpButton>
    </div>
  );
}
