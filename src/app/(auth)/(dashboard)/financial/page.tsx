import { FinancialContent } from "@/app/(auth)/(dashboard)/financial/components/financial-content";

export default async function FinancialPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FinancialContent />
    </div>
  );
}
