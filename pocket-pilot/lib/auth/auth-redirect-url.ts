export type AuthEmailFlow = "confirmation" | "recovery";

const LOCAL_DEVELOPMENT_ORIGIN = "http://localhost:3000";

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function resolveSiteOrigin(
  configuredSiteUrl: string | undefined,
  nodeEnvironment: string | undefined,
): string {
  const candidate = configuredSiteUrl?.trim();

  if (!candidate && nodeEnvironment !== "production") {
    return LOCAL_DEVELOPMENT_ORIGIN;
  }

  if (!candidate) {
    throw new Error("SITE_URL is required in production.");
  }

  let siteUrl: URL;

  try {
    siteUrl = new URL(candidate);
  } catch {
    throw new Error("SITE_URL must be an absolute URL.");
  }

  const usesHttps = siteUrl.protocol === "https:";
  const usesLocalHttp =
    siteUrl.protocol === "http:" && isLocalHostname(siteUrl.hostname);

  if (
    (!usesHttps && !usesLocalHttp) ||
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error("SITE_URL must be a secure application origin.");
  }

  return siteUrl.origin;
}

export function buildAuthEmailRedirectUrl(
  siteOrigin: string,
  flow: AuthEmailFlow,
): string {
  const validatedOrigin = resolveSiteOrigin(siteOrigin, "production");

  if (flow === "confirmation") {
    return new URL("/auth/confirm", validatedOrigin).toString();
  }

  const callbackUrl = new URL("/auth/callback", validatedOrigin);
  callbackUrl.searchParams.set("next", "/auth/reset-password");
  return callbackUrl.toString();
}

export function getAuthEmailRedirectUrl(flow: AuthEmailFlow): string {
  const siteOrigin = getSiteOrigin();

  return buildAuthEmailRedirectUrl(siteOrigin, flow);
}

export function getSiteOrigin(): string {
  return resolveSiteOrigin(
    process.env.SITE_URL,
    process.env.NODE_ENV,
  );
}
