import type { Metadata } from "next";
import { EstateDashboardContent } from "./components/estate-dashboard-content";

export const metadata: Metadata = {
  title: "Estate Administration | Pathible",
};

export default function EstateDashboardPage() {
  return <EstateDashboardContent />;
}
