import type { Metadata } from "next";
import { DistributionsContent } from "./components/distributions-content";

export const metadata: Metadata = {
  title: "Estate Distributions | Pathible",
};

export default function EstateDistributionsPage() {
  return <DistributionsContent />;
}
