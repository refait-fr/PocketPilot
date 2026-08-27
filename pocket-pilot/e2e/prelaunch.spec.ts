import { countFinancialRowsForUser, testAccountExists } from "./support/admin";
import { expect, test } from "./fixtures";
import { login } from "./support/ui";

function calendarDateInTimeZone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addUtcDays(calendarDate: string, days: number): string {
  const date = new Date(`${calendarDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function settingsLink(page: import("@playwright/test").Page) {
  return page.getByRole("link", { name: /Paramètres du profil/ }).first();
}

test("les préférences pilotent les dates et la devise se verrouille après une donnée financière", async ({ accounts, page }) => {
  const account = await accounts.create();
  await login(page, account);

  await settingsLink(page).click();
  await page.locator('select[name="currencyCode"]').selectOption("USD");
  await page.locator('input[name="timeZone"]').fill("America/New_York");
  await page.getByRole("button", { name: "Enregistrer les préférences" }).click();
  await expect(page.getByRole("status")).toHaveText("Les préférences sont enregistrées.");

  await page.getByRole("link", { exact: true, name: "Transactions" }).click();
  const dateInput = page.getByLabel("Date").last();
  const today = calendarDateInTimeZone("America/New_York");
  await expect(dateInput).toHaveAttribute("max", today);

  const tomorrow = addUtcDays(today, 1);
  await dateInput.evaluate((element) => element.removeAttribute("max"));
  await dateInput.fill(tomorrow);
  await page.getByLabel("Montant").last().fill("10,00");
  await page.getByRole("button", { name: "Ajouter la transaction" }).click();
  await expect(page.getByText("Une transaction future ne peut pas être enregistrée.", { exact: true })).toBeVisible();
  await expect(dateInput).toHaveValue(tomorrow);

  await page.getByRole("link", { exact: true, name: "Revenus" }).click();
  await page.getByLabel("Libellé").fill("Revenu verrouillage devise");
  await page.getByLabel("Montant mensuel").fill("1000,00");
  await page.getByRole("button", { name: "Ajouter ce revenu" }).click();
  await expect(page.getByRole("status")).toContainText("Le revenu a été ajouté");

  await settingsLink(page).click();
  await expect(page.locator('select[name="currencyCode"]')).toBeDisabled();
  await expect(page.getByText(/devise est verrouillée/i)).toBeVisible();
});

test("la suppression de compte efface Auth et toutes les données sans toucher à une autre session", async ({ accounts, browser, page }) => {
  test.setTimeout(90_000);
  const accountA = await accounts.create();
  const accountB = await accounts.create();

  await login(page, accountA);
  await page.getByRole("link", { exact: true, name: "Revenus" }).click();
  await page.getByLabel("Libellé").fill("Donnée à supprimer");
  await page.getByLabel("Montant mensuel").fill("100,00");
  await page.getByRole("button", { name: "Ajouter ce revenu" }).click();
  await expect(page.getByRole("status")).toContainText("Le revenu a été ajouté");

  const secondContext = await browser.newContext();
  const secondPage = await secondContext.newPage();
  try {
    await login(secondPage, accountB);
    await expect(secondPage.getByRole("heading", { name: "Bonjour !" })).toBeVisible();

    await settingsLink(page).click();
    await page.getByLabel("Saisissez SUPPRIMER pour confirmer").fill("SUPPRIMER");
    await page.getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
    await expect(page).toHaveURL(/\/auth\?notice=account-deleted$/);
    await expect(page.getByRole("status")).toHaveText("Votre compte et ses données ont été supprimés.");

    await expect.poll(() => testAccountExists(accountA.email)).toBe(false);
    await expect.poll(() => countFinancialRowsForUser(accountA.id)).toBe(0);
    expect(await testAccountExists(accountB.email)).toBe(true);
    await secondPage.reload();
    await expect(secondPage.getByRole("heading", { name: "Bonjour !" })).toBeVisible();

    await page.getByLabel("Adresse email").fill(accountA.email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(accountA.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByText("Email ou mot de passe incorrect.", { exact: true }),
    ).toBeVisible();
  } finally {
    await secondContext.close();
  }
});
