export function normalizeReferralSource(value: string | null | undefined): string | undefined {
  const source = typeof value === "string" ? value.trim() : undefined;
  return source && /^[a-zA-Z0-9_-]{1,100}$/.test(source) ? source : undefined;
}

export function referralRedirect(path: string, source: string | null | undefined): string {
  const referral = normalizeReferralSource(source);
  return referral ? `${path}?${new URLSearchParams({ ref: referral })}` : path;
}
