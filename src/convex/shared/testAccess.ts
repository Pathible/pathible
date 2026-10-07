import type { MutationCtx } from "../_generated/server";

export async function requireTestAccess(ctx: MutationCtx): Promise<void> {
  const environment = process.env.DEPLOYMENT_ENVIRONMENT;
  if (
    process.env.ENABLE_TEST_FUNCTIONS !== "true" ||
    (environment !== "development" && environment !== "test")
  ) {
    throw new Error("Test functions are disabled for this deployment");
  }
  const identity = await ctx.auth.getUserIdentity();
  const allowedEmails = (process.env.TEST_FUNCTION_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!identity?.email || !allowedEmails.includes(identity.email.toLowerCase())) {
    throw new Error("Test access requires an explicitly allowed test account");
  }
}
