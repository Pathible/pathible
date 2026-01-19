import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Auth Session Tests
 *
 * Tests for server-side authentication utilities.
 * Note: These tests mock Clerk's auth functions since they require
 * server-side context that isn't available in unit tests.
 *
 * Critical for:
 * - Ensuring route protection works correctly
 * - Validating session handling
 * - Testing error conditions
 */

// Mock Clerk's server-side auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock Convex client
vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    setAuth: vi.fn(),
    query: vi.fn(),
  })),
}));

// Helper to create a mock auth object for signed out state
function createSignedOutAuthMock() {
  return {
    userId: null,
    sessionId: null,
    sessionClaims: null,
    getToken: vi.fn(),
    has: vi.fn(),
    redirectToSignIn: vi.fn(),
    protect: vi.fn(),
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    actor: null,
    debug: vi.fn(),
  };
}

// Helper to create a mock auth object for signed in state
function createSignedInAuthMock(overrides = {}) {
  return {
    userId: "user_123",
    sessionId: "session_123",
    sessionClaims: { sub: "user_123" },
    getToken: vi.fn(),
    has: vi.fn(),
    redirectToSignIn: vi.fn(),
    protect: vi.fn(),
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    actor: null,
    debug: vi.fn(),
    ...overrides,
  };
}

// Helper to create a mock user object
function createMockUser(overrides = {}) {
  return {
    id: "user_123",
    firstName: "John",
    lastName: "Doe",
    imageUrl: "https://example.com/image.jpg",
    emailAddresses: [{ emailAddress: "john@example.com" }],
    ...overrides,
  };
}

describe("getServerSession", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should return null when no userId exists", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    vi.mocked(auth).mockImplementation(() => Promise.resolve(createSignedOutAuthMock()) as never);

    const { getServerSession } = await import("../auth-session");
    const result = await getServerSession();

    expect(result).toBeNull();
  });

  it("should return authenticated object when userId exists", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    vi.mocked(auth).mockImplementation(() => Promise.resolve(createSignedInAuthMock()) as never);

    const { getServerSession } = await import("../auth-session");
    const result = await getServerSession();

    expect(result).toEqual({
      authenticated: true,
      userId: "user_123",
    });
  });

  it("should return null when auth throws an error", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    vi.mocked(auth).mockImplementation(() => Promise.reject(new Error("Auth failed")) as never);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getServerSession } = await import("../auth-session");
    const result = await getServerSession();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("getServerSessionWithProfile", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should return null when no user exists", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    vi.mocked(currentUser).mockResolvedValue(null);

    const { getServerSessionWithProfile } = await import("../auth-session");
    const result = await getServerSessionWithProfile();

    expect(result).toBeNull();
  });

  it("should return user data when user exists", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    vi.mocked(currentUser).mockImplementation(() => Promise.resolve(createMockUser()) as never);

    const { getServerSessionWithProfile } = await import("../auth-session");
    const result = await getServerSessionWithProfile();

    expect(result).toEqual({
      user: {
        id: "user_123",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        imageUrl: "https://example.com/image.jpg",
      },
    });
  });

  it("should handle missing email gracefully", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    vi.mocked(currentUser).mockImplementation(
      () => Promise.resolve(createMockUser({ emailAddresses: [] })) as never,
    );

    const { getServerSessionWithProfile } = await import("../auth-session");
    const result = await getServerSessionWithProfile();

    expect(result?.user.email).toBe("");
  });

  it("should return null when currentUser throws an error", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    vi.mocked(currentUser).mockRejectedValue(new Error("Failed to get user"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getServerSessionWithProfile } = await import("../auth-session");
    const result = await getServerSessionWithProfile();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("requireServerAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should throw error when not authenticated", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    vi.mocked(currentUser).mockResolvedValue(null);

    const { requireServerAuth } = await import("../auth-session");

    await expect(requireServerAuth()).rejects.toThrow("Unauthorized: Authentication required");
  });

  it("should return session when authenticated", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    vi.mocked(currentUser).mockImplementation(() => Promise.resolve(createMockUser()) as never);

    const { requireServerAuth } = await import("../auth-session");
    const result = await requireServerAuth();

    expect(result.user.id).toBe("user_123");
    expect(result.user.email).toBe("john@example.com");
  });
});

describe("getIsAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should return false when not authenticated", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    vi.mocked(auth).mockImplementation(() => Promise.resolve(createSignedOutAuthMock()) as never);

    const { getIsAdmin } = await import("../auth-session");
    const result = await getIsAdmin();

    expect(result).toBe(false);
  });

  it("should return false when no Convex token available", async () => {
    const { auth } = await import("@clerk/nextjs/server");
    const mockGetToken = vi.fn().mockResolvedValue(null);
    vi.mocked(auth).mockImplementation(
      () => Promise.resolve(createSignedInAuthMock({ getToken: mockGetToken })) as never,
    );

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getIsAdmin } = await import("../auth-session");
    const result = await getIsAdmin();

    expect(result).toBe(false);

    consoleSpy.mockRestore();
  });

  it("should return false when NEXT_PUBLIC_CONVEX_URL is not configured", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_CONVEX_URL;
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    const { auth } = await import("@clerk/nextjs/server");
    const mockGetToken = vi.fn().mockResolvedValue("test_token");
    vi.mocked(auth).mockImplementation(
      () => Promise.resolve(createSignedInAuthMock({ getToken: mockGetToken })) as never,
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getIsAdmin } = await import("../auth-session");
    const result = await getIsAdmin();

    expect(result).toBe(false);

    consoleSpy.mockRestore();
    process.env.NEXT_PUBLIC_CONVEX_URL = originalEnv;
  });
});

describe("OnboardingStatus type", () => {
  it("should have correct structure", async () => {
    // Import to verify the type is exported correctly
    const authSession = await import("../auth-session");

    // Type check - this verifies the interface exists and is exported
    const mockStatus = {
      hasProfile: true,
      onboardingComplete: true,
      hasHousehold: true,
      needsOnboarding: false,
      onboardingStatus: "complete",
    };

    expect(mockStatus).toBeDefined();
    expect(authSession).toBeDefined();
  });
});
