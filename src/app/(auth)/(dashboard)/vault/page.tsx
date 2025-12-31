import { VaultContent } from "@/app/(auth)/(dashboard)/vault/components/vault-content";

export default async function VaultPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <VaultContent />
    </div>
  );
}
