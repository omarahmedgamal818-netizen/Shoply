import "server-only";
import Stripe from "stripe";
import type { headers } from "next/headers";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function isLocalHost(host: string) {
  return (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1") ||
    /^192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host)
  );
}

export async function appOrigin(headerList: Awaited<ReturnType<typeof headers>>) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = headerList.get("host") ?? "localhost:3000";
  if (!isLocalHost(host)) return "http://localhost:3000";
  return `http://${host}`;
}
