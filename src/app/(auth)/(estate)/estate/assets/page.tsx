import type { Metadata } from "next";
import { AssetsContent } from "./components/assets-content";

export const metadata: Metadata = {
  title: "Estate Assets | Pathible",
};

export default function EstateAssetsPage() {
  return <AssetsContent />;
}
