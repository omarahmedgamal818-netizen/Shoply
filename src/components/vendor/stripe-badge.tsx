import { Chip } from "@/components/ui/chip";
import type { StripeStatus, VendorStatus } from "@/lib/types";

const stripeCopy: Record<StripeStatus, { label: string; tone: "success" | "warning" | "error" | "neutral" }> = {
  connected: { label: "Bank connected", tone: "success" },
  pending: { label: "Stripe pending", tone: "warning" },
  restricted: { label: "Stripe restricted", tone: "error" },
  not_connected: { label: "Bank not connected", tone: "neutral" },
};

export function StripeBadge({ status }: { status: StripeStatus }) {
  const item = stripeCopy[status];
  return <Chip tone={item.tone}>{item.label}</Chip>;
}

export function VendorStatusChip({ status }: { status: VendorStatus }) {
  const tone = status === "active" ? "success" : status === "rejected" ? "error" : "warning";
  return <Chip tone={tone}>{status}</Chip>;
}
