import type { Metadata } from "next";
import { CommunicationsContent } from "./components/communications-content";

export const metadata: Metadata = {
  title: "Estate Communications | Pathible",
};

export default function EstateCommunicationsPage() {
  return <CommunicationsContent />;
}
