import type { Id } from "@/convex/_generated/dataModel";
import { TourEditor } from "./tour-editor";

interface TourEditorPageProps {
  params: Promise<{ tourId: string }>;
}

export default async function TourEditorPage({ params }: TourEditorPageProps) {
  const { tourId } = await params;
  return <TourEditor tourId={tourId as Id<"tours">} />;
}
