import { Loader2 } from "lucide-react";

/**
 * Full-page loading spinner for page transitions and auth checks.
 * Centers a spinner in the viewport with the app's background color.
 */
export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
