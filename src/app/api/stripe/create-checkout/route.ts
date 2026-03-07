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
 * Create a Stripe Checkout Session for subscription or one-time purchase.
 *
 * POST /api/stripe/create-checkout
 * Body: { priceId: string, mode: "subscription" | "payment" }
 *
 * Requires authentication via Clerk.
 * Passes householdId, clerkUserId, and priceId in session metadata
 * so the Stripe webhook can update the correct household.
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

    const body = (await request.json()) as {
      priceId: string;
      mode: "subscription" | "payment";
    };
    const { priceId, mode } = body;

    if (!priceId || !mode) {
      return NextResponse.json({ error: "Missing priceId or mode" }, { status: 400 });
    }

    // Get the user's household from Convex
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
      return NextResponse.json(
        { error: "No household found. Please complete onboarding first." },
        { status: 400 },
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const stripe = getStripe();

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
        metadata: {
          clerkUserId: userId,
          householdId: subscription.householdId,
        },
      });
      customerId = customer.id;
    }

    // Build checkout session params
    const origin = new URL(request.url).origin;
    const successUrl =
      mode === "payment"
        ? `${origin}/estate?checkout=success`
        : `${origin}/dashboard?checkout=success`;
    const cancelUrl = mode === "payment" ? `${origin}/for-executors` : `${origin}/select-plan`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: {
        householdId: subscription.householdId,
        clerkUserId: userId,
        priceId,
      },
    };

    if (mode === "subscription") {
      sessionParams.subscription_data = {
        trial_period_days: 7,
        metadata: {
          householdId: subscription.householdId,
          clerkUserId: userId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
