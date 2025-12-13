"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [status, setStatus] = useState<"signing-out" | "error">("signing-out");

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ redirectUrl: "/sign-in" });
      } catch (error) {
        console.error("[Sign Out] Exception during sign out:", error);
        setStatus("error");
      }
    };

    handleSignOut();
  }, [signOut]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Sign Out Error</h1>
          <p className="text-gray-600 mb-4">
            There was an error signing you out. Please try again.
          </p>
          <Button
            onClick={() => router.push("/sign-in")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" />
        <p className="text-gray-600">Signing you out...</p>
      </div>
    </div>
  );
}
