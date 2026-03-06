import type { Metadata } from "next";
import { DocumentsContent } from "./components/documents-content";

export const metadata: Metadata = {
  title: "Estate Documents | Pathible",
};

export default function EstateDocumentsPage() {
  return <DocumentsContent />;
}
