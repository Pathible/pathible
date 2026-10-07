import { describe, expect, it } from "vitest";
import { billingFailure } from "./billing-errors";

describe("billing failure messages", () => {
  it("identifies a frontend/backend deployment mismatch", () => {
    expect(
      billingFailure(new Error("Could not find public function for 'stripeActions:createPortal'")),
    ).toEqual({
      status: 503,
      error:
        "Billing is temporarily unavailable. The Convex billing backend needs to be deployed for this application.",
    });
  });
  it("does not expose backend details or misdiagnose unrelated failures", () => {
    expect(billingFailure(new Error("secret provider details"))).toEqual({
      status: 503,
      error: "Billing is temporarily unavailable. Please try again or contact support.",
    });
  });
});
