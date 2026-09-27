import { NextResponse } from "next/server";
import { fulfillPaidSession } from "@/lib/payouts";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    if (!consumeRateLimit("stripe-webhook-invalid", 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" && event.data.object.object === "checkout.session") {
    await fulfillPaidSession(event.data.object);
  }
  return NextResponse.json({ received: true });
}
