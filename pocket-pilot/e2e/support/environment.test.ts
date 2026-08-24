import assert from "node:assert/strict";
import test from "node:test";

import { readE2EEnvironment } from "./environment.ts";

const environmentNames = [
  "E2E_BASE_URL",
  "E2E_CONFIRM_NON_PRODUCTION",
  "E2E_MAILPIT_URL",
  "E2E_SUPABASE_PUBLISHABLE_KEY",
  "E2E_SUPABASE_SERVICE_ROLE_KEY",
  "E2E_SUPABASE_URL",
] as const;

const validEnvironment = {
  E2E_BASE_URL: "http://127.0.0.1:3000",
  E2E_CONFIRM_NON_PRODUCTION: "true",
  E2E_MAILPIT_URL: "http://127.0.0.1:54324",
  E2E_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
  E2E_SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key",
  E2E_SUPABASE_URL: "http://127.0.0.1:54321",
} as const;

function withEnvironment(
  values: Partial<Record<(typeof environmentNames)[number], string>>,
  assertion: () => void,
) {
  const previousValues = Object.fromEntries(
    environmentNames.map((name) => [name, process.env[name]]),
  );

  for (const name of environmentNames) {
    const value = values[name];

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

  try {
    assertion();
  } finally {
    for (const name of environmentNames) {
      const value = previousValues[name];

      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}

test("accepte uniquement une configuration E2E explicitement confirmée", () => {
  withEnvironment(validEnvironment, () => {
    assert.deepEqual(readE2EEnvironment(), {
      baseUrl: "http://127.0.0.1:3000",
      mailpitUrl: "http://127.0.0.1:54324",
      supabasePublishableKey: "public-test-key",
      supabaseServiceRoleKey: "service-role-test-key",
      supabaseUrl: "http://127.0.0.1:54321",
    });
  });
});

test("exige Mailpit pour les parcours email réels", () => {
  const withoutMailpit: Partial<
    Record<(typeof environmentNames)[number], string>
  > = { ...validEnvironment };
  delete withoutMailpit.E2E_MAILPIT_URL;

  withEnvironment(withoutMailpit, () => {
    assert.throws(() => readE2EEnvironment(), /E2E_MAILPIT_URL/);
  });
});

test("refuse une cible non confirmée comme non-production", () => {
  withEnvironment(
    { ...validEnvironment, E2E_CONFIRM_NON_PRODUCTION: "false" },
    () => {
      assert.throws(
        () => readE2EEnvironment(),
        /E2E_CONFIRM_NON_PRODUCTION=true/,
      );
    },
  );
});

test("refuse de lancer l’application Playwright sur un domaine public", () => {
  withEnvironment(
    { ...validEnvironment, E2E_BASE_URL: "https://pocketpilot.example" },
    () => {
      assert.throws(() => readE2EEnvironment(), /application locale/);
    },
  );
});

test("refuse de confondre les clés Supabase publique et privilégiée", () => {
  withEnvironment(
    {
      ...validEnvironment,
      E2E_SUPABASE_SERVICE_ROLE_KEY:
        validEnvironment.E2E_SUPABASE_PUBLISHABLE_KEY,
    },
    () => {
      assert.throws(() => readE2EEnvironment(), /ne peuvent pas être identiques/);
    },
  );
});
