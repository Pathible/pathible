import { Shield } from "lucide-react";
import { VaultContent } from "@/app/(auth)/vault/components/vault-content";

export default async function VaultPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Heritage Vault</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Securely store and organize important documents for your family
        </p>
      </div>

      {/* Main Content - Client Component */}
      <VaultContent />
    </div>
  );
}
