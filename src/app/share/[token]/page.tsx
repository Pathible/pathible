import type { Metadata } from "next";
import { SharePageContent } from "./components/share-page-content";

export const metadata: Metadata = {
  title: "Shared Document | Pathible",
  description: "Access a securely shared document from Pathible estate administration.",
  robots: { index: false, follow: false },
};

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <SharePageContent token={token} />
    </div>
  );
}
