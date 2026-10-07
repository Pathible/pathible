import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { referralRedirect } from "@/lib/referral";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params.ref ?? (await cookies()).get("pathible_ref")?.value;
  redirect(referralRedirect("/sign-up", ref));
}
