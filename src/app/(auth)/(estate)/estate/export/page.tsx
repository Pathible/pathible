import type { Metadata } from "next";
import { ExportContent } from "./components/export-content";

export const metadata: Metadata = {
  title: "Export Estate Summary | Pathible",
};

export default function EstateExportPage() {
  return <ExportContent />;
}
