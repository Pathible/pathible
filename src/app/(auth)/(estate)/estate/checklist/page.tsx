import type { Metadata } from "next";
import { ChecklistContent } from "./components/checklist-content";

export const metadata: Metadata = {
  title: "Estate Checklist | Pathible",
};

export default function EstateChecklistPage() {
  return <ChecklistContent />;
}
