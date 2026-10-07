import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { billingFailure } from "@/lib/billing-errors";

export async function POST(request: Request): Promise<NextResponse> {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  const token = await getToken({ template: "convex" });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const convex = new ConvexHttpClient(url);
  convex.setAuth(token);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("priceId" in body) ||
    typeof body.priceId !== "string" ||
    !("mode" in body) ||
    (body.mode !== "subscription" && body.mode !== "payment")
  ) {
    return NextResponse.json({ error: "Invalid priceId or mode" }, { status: 400 });
  }
  try {
    const result = await convex.action(api.stripeActions.createCheckout, {
      priceId: body.priceId,
      mode: body.mode,
      origin: new URL(request.url).origin,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Stripe Billing]", error);
    const failure = billingFailure(error);
    return NextResponse.json({ error: failure.error }, { status: failure.status });
  }
}
