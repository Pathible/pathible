export function billingFailure(cause: unknown): { status: number; error: string } {
  const message = cause instanceof Error ? cause.message : "";
  if (message.includes("Could not find public function") && message.includes("stripeActions:")) {
    return {
      status: 503,
      error:
        "Billing is temporarily unavailable. The Convex billing backend needs to be deployed for this application.",
    };
  }
  return {
    status: 503,
    error: "Billing is temporarily unavailable. Please try again or contact support.",
  };
}
