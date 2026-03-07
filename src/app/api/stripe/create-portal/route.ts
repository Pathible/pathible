import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { api } from "@/convex/_generated/api";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 *
 * POST /api/stripe/create-portal
 *
 * Allows users to:
 * - Update payment methods
 * - View invoices
 * - Cancel subscription
 * - Change plans (if configured in Stripe Portal settings)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Get the user's household from Convex to find Stripe Customer ID
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
    if (!token) {
      return NextResponse.json({ error: "Auth token unavailable" }, { status: 401 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);

    const subscription = await convex.query(api.auth.getEffectiveSubscription);
    if (!subscription?.householdId) {
      return NextResponse.json({ error: "No household found" }, { status: 400 });
    }

    // Look up the Stripe customer by email
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    const stripe = getStripe();
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/profile-settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Portal] Error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
