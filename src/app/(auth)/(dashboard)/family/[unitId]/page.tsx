import { FamilyUnitDetail } from "../components/family-unit-detail";

interface PageProps {
  params: Promise<{ unitId: string }>;
}

export default async function FamilyUnitPage({ params }: PageProps) {
  const { unitId } = await params;

  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FamilyUnitDetail unitId={unitId} />
    </div>
  );
}
