const AUTH_REDIRECT_FALLBACK = "/onboarding";
const POCKETPILOT_ORIGIN = new URL("https://pocketpilot.invalid");

export function safeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return AUTH_REDIRECT_FALLBACK;
  }

  try {
    const resolvedUrl = new URL(value, POCKETPILOT_ORIGIN);

    if (resolvedUrl.origin !== POCKETPILOT_ORIGIN.origin) {
      return AUTH_REDIRECT_FALLBACK;
    }

    return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
  } catch {
    return AUTH_REDIRECT_FALLBACK;
  }
}
