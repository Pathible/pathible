import { type ReactNode, Suspense } from "react";
import { EstateSidebar } from "@/components/estate-sidebar";
import { EstateStatusBanner } from "@/components/estate-status-banner";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EstateModeProvider } from "@/hooks/use-estate-mode";

/**
 * Estate Layout - Wraps all estate administration routes
 *
 * Provides the EstateSidebar, EstateStatusBanner, and EstateModeProvider.
 * Authentication is already handled by the parent (auth) layout.
 * EstateModeProvider ensures one shared Convex subscription for estate state.
 */
export default function EstateGroupLayout({ children }: { children: ReactNode }) {
  return (
    <EstateModeProvider>
      <SidebarProvider defaultOpen={true}>
        <EstateSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Estate Administration</h1>
            </div>
          </header>
          <Suspense fallback={null}>
            <EstateStatusBanner />
          </Suspense>
          <main className="flex-1 overflow-auto p-6">{children}</main>
          <footer className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            This tool is for organizational purposes only and does not constitute legal advice.
            Consult a qualified attorney for legal guidance.
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </EstateModeProvider>
  );
}
