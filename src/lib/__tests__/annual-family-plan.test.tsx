// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnualFamilyPlan } from "@/components/annual-family-plan";

const state = vi.hoisted(() => ({
  signedIn: false,
  loading: false,
  unavailable: false,
  checkout: vi.fn(),
}));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ isSignedIn: state.signedIn }) }));
vi.mock("@clerk/nextjs/experimental", () => ({
  usePlans: () => ({
    isLoading: state.loading,
    data: state.unavailable
      ? []
      : [
          {
            id: "legacy_1",
            slug: "legacy",
            annualFee: {
              amount: 55188,
              amountFormatted: "551.88",
              currencySymbol: "$",
              currency: "USD",
            },
          },
          { id: "free_1", slug: "free", annualFee: null },
        ],
  }),
  CheckoutButton: (props: { children: ReactNode; planId: string; planPeriod: string }) => {
    state.checkout(props);
    return props.children;
  },
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("ref=law-firm") }));

describe("one annual family plan", () => {
  beforeEach(() => {
    state.signedIn = false;
    state.loading = false;
    state.unavailable = false;
    state.checkout.mockClear();
  });
  afterEach(cleanup);
  it("shows the full annual charge and carries referral attribution to signup", () => {
    render(<AnnualFamilyPlan />);
    expect(screen.getByText("$551.88")).toBeDefined();
    expect(screen.getByRole("link", { name: "Organize My Family" }).getAttribute("href")).toBe(
      "/signup?ref=law-firm",
    );
    expect(state.checkout).not.toHaveBeenCalled();
  });
  it("checks out only the annual legacy plan and verifies the purchase afterward", () => {
    state.signedIn = true;
    render(<AnnualFamilyPlan />);
    expect(state.checkout).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "legacy_1",
        planPeriod: "annual",
        newSubscriptionRedirectUrl: "/billing-return?next=%2Fonboarding",
      }),
    );
    expect(screen.queryByText("Monthly")).toBeNull();
  });
  it("does not invent a price or permit checkout when the annual plan is unavailable", () => {
    state.unavailable = true;
    render(<AnnualFamilyPlan />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
    expect(state.checkout).not.toHaveBeenCalled();
  });
});
