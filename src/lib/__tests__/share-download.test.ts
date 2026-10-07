import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/share/[token]/route";

const state = vi.hoisted(() => ({
  emails: [] as { emailAddress: string; verification: { status: string } }[],
  consumed: true,
  mutation: vi.fn(),
  signedUrl: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: async () => ({ emailAddresses: state.emails }),
}));
vi.mock("@/convex/_generated/api", () => ({
  api: { estateDocuments: { getShareByToken: "share" } },
  internal: {
    estateDocuments: {
      getShareDocumentB2Info: "document",
      consumeShareDownload: "consume",
      checkShareRateLimit: "rate",
    },
  },
}));
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    setAdminAuth() {}
    async query(ref: unknown) {
      return ref === "share"
        ? { status: "active", expiresAt: Date.now() + 60000, downloadCount: 0, maxDownloads: 1 }
        : {
            recipientEmail: "recipient@example.com",
            b2FileName: "private-file",
            documentName: "Will",
            fileType: "application/pdf",
          };
    }
    async mutation(ref: unknown, args: unknown) {
      state.mutation(ref, args);
      return ref === "rate" || state.consumed;
    }
  },
}));
vi.mock("@/lib/backblaze/s3-client", () => ({
  getBackblazeS3Client: () => ({
    getPresignedDownloadUrl: async () => {
      state.signedUrl();
      return { downloadUrl: "https://example.com/private-url", expiresIn: 3600 };
    },
  }),
}));
let sequence = 0;
function download() {
  return POST(
    new Request("https://example.com/api/share/token", {
      method: "POST",
      body: JSON.stringify({ action: "download" }),
    }),
    { params: Promise.resolve({ token: `unique-share-token-for-test-${++sequence}` }) },
  );
}
describe("recipient-protected document downloads", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://example.convex.cloud");
    vi.stubEnv("CONVEX_DEPLOY_KEY", "synthetic-test-key");
    state.emails = [];
    state.consumed = true;
    state.mutation.mockClear();
    state.signedUrl.mockClear();
  });
  it("requires a verified recipient email", async () => {
    state.emails = [
      { emailAddress: "recipient@example.com", verification: { status: "unverified" } },
    ];
    expect((await download()).status).toBe(401);
    expect(state.signedUrl).not.toHaveBeenCalled();
  });
  it("rejects other authenticated users", async () => {
    state.emails = [{ emailAddress: "other@example.com", verification: { status: "verified" } }];
    expect((await download()).status).toBe(403);
    expect(state.signedUrl).not.toHaveBeenCalled();
  });
  it("atomically counts an authorized download before returning the URL", async () => {
    state.emails = [
      { emailAddress: "RECIPIENT@example.com", verification: { status: "verified" } },
    ];
    const response = await download();
    expect(response.status).toBe(200);
    expect(state.mutation).toHaveBeenCalledWith(
      "consume",
      expect.objectContaining({ verifiedEmails: ["recipient@example.com"] }),
    );
    expect(await response.json()).toHaveProperty("downloadUrl");
  });
  it("withholds the URL when another request exhausts or revokes the share", async () => {
    state.emails = [
      { emailAddress: "recipient@example.com", verification: { status: "verified" } },
    ];
    state.consumed = false;
    const response = await download();
    expect(response.status).toBe(410);
    expect(await response.json()).not.toHaveProperty("downloadUrl");
  });
});
