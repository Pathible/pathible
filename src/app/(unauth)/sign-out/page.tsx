"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function SignOutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"signing-out" | "error">("signing-out");

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
              console.error("[Sign Out] Error signing out:", ctx.error);
              setStatus("error");
            },
          },
        });
      } catch (error) {
        console.error("[Sign Out] Exception during sign out:", error);
        setStatus("error");
      }
    };

    signOut();
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Sign Out Error</h1>
          <p className="text-gray-600 mb-4">
            There was an error signing you out. Please try again.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
        <p className="text-gray-600">Signing you out...</p>
      </div>
    </div>
  );
}
