export type E2EEnvironment = {
  baseUrl: string;
  mailpitUrl: string;
  supabasePublishableKey: string;
  supabaseServiceRoleKey: string;
  supabaseUrl: string;
};

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

function readRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `La variable ${name} est obligatoire pour les tests E2E. Consultez la section Playwright du README.`,
    );
  }

  return value;
}

function readHttpUrl(name: string, value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`La variable ${name} doit contenir une URL HTTP valide.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`La variable ${name} doit utiliser HTTP ou HTTPS.`);
  }

  return url;
}

export function readE2EEnvironment(): E2EEnvironment {
  const baseUrl = readHttpUrl(
    "E2E_BASE_URL",
    process.env.E2E_BASE_URL?.trim() || DEFAULT_BASE_URL,
  );
  const supabaseUrl = readHttpUrl(
    "E2E_SUPABASE_URL",
    readRequiredEnvironmentVariable("E2E_SUPABASE_URL"),
  );
  const supabasePublishableKey = readRequiredEnvironmentVariable(
    "E2E_SUPABASE_PUBLISHABLE_KEY",
  );
  const supabaseServiceRoleKey = readRequiredEnvironmentVariable(
    "E2E_SUPABASE_SERVICE_ROLE_KEY",
  );

  if (!["127.0.0.1", "localhost"].includes(baseUrl.hostname)) {
    throw new Error(
      "E2E_BASE_URL doit pointer vers l’application locale, jamais vers un déploiement public.",
    );
  }

  if (process.env.E2E_CONFIRM_NON_PRODUCTION !== "true") {
    throw new Error(
      "Définissez E2E_CONFIRM_NON_PRODUCTION=true après avoir vérifié que Supabase est local ou dédié aux tests.",
    );
  }

  if (supabasePublishableKey === supabaseServiceRoleKey) {
    throw new Error(
      "Les clés Supabase publique et service_role E2E ne peuvent pas être identiques.",
    );
  }

  const mailpitUrl = readHttpUrl(
    "E2E_MAILPIT_URL",
    readRequiredEnvironmentVariable("E2E_MAILPIT_URL"),
  );

  return {
    baseUrl: baseUrl.origin,
    mailpitUrl: mailpitUrl.origin,
    supabasePublishableKey,
    supabaseServiceRoleKey,
    supabaseUrl: supabaseUrl.origin,
  };
}
