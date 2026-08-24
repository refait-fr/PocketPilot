import { randomUUID } from "node:crypto";

import {
  expect,
  test as base,
  type Page,
  type TestInfo,
} from "@playwright/test";

import {
  createConfirmedAccount,
  deleteTestAccount,
  deleteTestAccountByEmail,
  type TestAccount,
} from "./support/admin";

type AccountFactory = {
  create(options?: { withProfile?: boolean }): Promise<TestAccount>;
  trackSignup(email: string): void;
  uniqueCredentials(): Pick<TestAccount, "email" | "password">;
};

type PocketPilotFixtures = {
  accounts: AccountFactory;
};

function uniqueCredentials(testInfo: TestInfo) {
  const suffix = `${Date.now()}-${testInfo.workerIndex}-${randomUUID().slice(0, 8)}`;

  return {
    email: `pocketpilot-e2e-${suffix}@example.test`,
    password: `PocketPilot-${randomUUID().slice(0, 12)}-9a!`,
  };
}

function monitorBrowser(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  let sensitiveConsoleOutput = false;

  page.on("console", (message) => {
    const text = message.text();

    if (message.type() === "error") {
      consoleErrors.push(text);
    }

    if (
      /service_role|sb_secret_|access_token|refresh_token|eyJ[A-Za-z0-9_-]{20,}/i.test(
        text,
      )
    ) {
      sensitiveConsoleOutput = true;
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText ?? "échec inconnu";

    if (!errorText.includes("ERR_ABORTED")) {
      failedRequests.push(`${request.method()} ${request.url()}`);
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  return () => {
    expect.soft(consoleErrors, "aucune erreur console").toHaveLength(0);
    expect.soft(pageErrors, "aucune erreur JavaScript non gérée").toHaveLength(0);
    expect
      .soft(failedRequests, "aucune requête inattendue en échec")
      .toHaveLength(0);
    expect
      .soft(sensitiveConsoleOutput, "aucun token ou secret dans la console")
      .toBe(false);
  };
}

export const test = base.extend<PocketPilotFixtures>({
  accounts: async ({ browserName }, provide, testInfo) => {
    void browserName;
    const trackedEmails: string[] = [];
    const trackedUserIds: string[] = [];
    const credentials = () => uniqueCredentials(testInfo);

    await provide({
      async create(options) {
        const account = await createConfirmedAccount({
          ...credentials(),
          withProfile: options?.withProfile,
        });
        trackedUserIds.push(account.id);
        return account;
      },
      trackSignup(email) {
        trackedEmails.push(email);
      },
      uniqueCredentials: credentials,
    });

    const cleanupResults = await Promise.allSettled([
      ...trackedUserIds.reverse().map((userId) => deleteTestAccount(userId)),
      ...trackedEmails.reverse().map((email) => deleteTestAccountByEmail(email)),
    ]);

    if (cleanupResults.some((result) => result.status === "rejected")) {
      throw new Error("Le nettoyage d’au moins un compte E2E a échoué.");
    }
  },
  page: async ({ page }, provide) => {
    const assertCleanBrowser = monitorBrowser(page);
    await provide(page);
    assertCleanBrowser();
  },
});

export { expect } from "@playwright/test";
