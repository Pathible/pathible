import type { Metadata } from "next";
import { SharesContent } from "./components/shares-content";

export const metadata: Metadata = {
  title: "Document Sharing | Pathible",
};

export default function EstateSharesPage() {
  return <SharesContent />;
}
