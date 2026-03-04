import type { Metadata } from "next";
import { ActivateEstateContent } from "./components/activate-estate-content";

export const metadata: Metadata = {
  title: "Activate Estate Administration | Pathible",
};

export default function ActivateEstatePage() {
  return <ActivateEstateContent />;
}
