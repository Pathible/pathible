"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      try {
        console.log("[Sign Out] Starting sign out process...");

        // Call Better Auth signOut
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              console.log("[Sign Out] Successfully signed out");
              // Redirect to login after successful sign out
              router.push("/login");
            },
            onError: (ctx) => {
              // 400 errors often occur when session is already expired/invalid
              // This is not a real error - user is effectively signed out
              console.warn("[Sign Out] Server returned error (likely expired session):", ctx.error);
              // Still redirect to login since user wanted to sign out
              router.push("/login");
            },
          },
        });
      } catch (error) {
        console.error("[Sign Out] Exception during sign out:", error);
        // Even on exception, attempt to redirect - user wanted to sign out
        router.push("/login");
      }
    };

    signOut();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
        <p className="text-gray-600">Signing you out...</p>
      </div>
    </div>
  );
}
