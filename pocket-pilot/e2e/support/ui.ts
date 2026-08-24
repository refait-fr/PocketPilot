import { expect, type Locator, type Page } from "@playwright/test";

import type { TestAccount } from "./admin";

export async function login(page: Page, account: TestAccount): Promise<void> {
  await page.goto("/auth");
  await page.getByLabel("Adresse email").fill(account.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

export async function expectDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Votre mois, en un coup d’œil." }),
  ).toBeVisible();
  await expect(page.getByText("Reste mensuel disponible")).toBeVisible();
}

export async function completeOnboarding(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(
    page.getByRole("heading", { name: "Deux repères, puis on trace la route." }),
  ).toBeVisible();
  await page.getByLabel("Devise de référence").selectOption("EUR");
  await page.getByLabel("Fuseau horaire").fill("Europe/Paris");
  await page
    .getByRole("button", { name: "Valider mon point de départ" })
    .click();
  await expectDashboard(page);
}

export function dashboardMetric(page: Page, label: string): Locator {
  return page.locator("article").filter({ hasText: label });
}

export function listRow(page: Page, heading: string): Locator {
  return page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { exact: true, name: heading }) });
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}
