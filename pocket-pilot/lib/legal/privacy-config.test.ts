import assert from "node:assert/strict";
import test from "node:test";

import { getPrivacyConfiguration } from "./privacy-config.ts";

function withEnv(values: Record<string, string | undefined>, run: () => void): void {
  const previous: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("conserve une configuration complète et valide", () => {
  withEnv(
    {
      PRIVACY_CONTACT_EMAIL: "privacy@example.com",
      PRIVACY_CONTROLLER_NAME: "PocketPilot SAS",
    },
    () => {
      assert.deepEqual(getPrivacyConfiguration(), {
        contactEmail: "privacy@example.com",
        controllerName: "PocketPilot SAS",
      });
    },
  );
});

test("signale une configuration absente", () => {
  withEnv(
    { PRIVACY_CONTACT_EMAIL: undefined, PRIVACY_CONTROLLER_NAME: "  " },
    () => {
      assert.deepEqual(getPrivacyConfiguration(), {
        contactEmail: null,
        controllerName: null,
      });
    },
  );
});

test("rejette un email de contact malformé comme absent", () => {
  withEnv(
    {
      PRIVACY_CONTACT_EMAIL: "not-an-email",
      PRIVACY_CONTROLLER_NAME: "PocketPilot SAS",
    },
    () => {
      assert.deepEqual(getPrivacyConfiguration(), {
        contactEmail: null,
        controllerName: "PocketPilot SAS",
      });
    },
  );
});
