import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const selectedPlan =
    plan && ["foundations", "heritage", "legacy"].includes(plan) ? plan : undefined;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image
              src="/pathible-logo.svg"
              alt="Pathible"
              width={150}
              height={150}
              className="h-12 w-auto mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-crimson font-semibold text-foreground mb-2">
            Begin Your Legacy Journey
          </h1>
          <p className="text-muted-foreground">
            Create your account and take the first step toward peace of mind
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
            forceRedirectUrl={selectedPlan ? `/onboarding?plan=${selectedPlan}` : undefined}
            fallbackRedirectUrl="/onboarding"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
