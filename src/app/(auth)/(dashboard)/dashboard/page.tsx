import { DashboardContent } from "@/app/(auth)/dashboard/components/dashboard-content";

export default async function DashboardPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <DashboardContent />
    </div>
  );
}
