import { SignUp } from "@clerk/nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { referralRedirect } from "@/lib/referral";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params.ref ?? (await cookies()).get("pathible_ref")?.value;
  const onboardingUrl = referralRedirect("/onboarding", ref);
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
            Organize Your Family's Essentials
          </h1>
          <p className="text-muted-foreground">
            Create your account, then choose your annual family plan.
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
            fallbackRedirectUrl={onboardingUrl}
            forceRedirectUrl={onboardingUrl}
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
