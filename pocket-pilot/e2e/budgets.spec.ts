import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { listRow, login } from "./support/ui";

function formForButton(page: Page, name: string): Locator {
  return page.getByRole("button", { name, exact: true }).locator("xpath=ancestor::form");
}

function budgetRow(page: Page, category: string): Locator {
  return page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: category, exact: true }),
  });
}

async function createTransaction(
  page: Page,
  amount: string,
  description: string,
): Promise<void> {
  await page.getByRole("link", { name: "Transactions" }).click();
  const submitButton = page.getByRole("button", {
    exact: true,
    name: "Ajouter la transaction",
  });
  const creationDisclosure = page.locator(".creation-disclosure");
  const disclosureButton = creationDisclosure.locator(".creation-summary");
  await expect(disclosureButton).toBeVisible();
  await expect.poll(async () => {
    if (await submitButton.isVisible()) return true;
    if ((await disclosureButton.getAttribute("aria-expanded")) === "false") {
      await disclosureButton.click();
    }
    return false;
  }).toBe(true);
  const form = submitButton.locator("xpath=ancestor::form");
  await form.getByLabel("Montant").fill(amount);
  await form.getByLabel("Catégorie").selectOption("Shopping");
  await form.getByLabel(/Description/).fill(description);
  await form.getByRole("button", { name: "Ajouter la transaction" }).click();
  await expect(listRow(page, description)).toBeVisible();
}

test("les budgets par catégorie suivent les transactions du mois", async ({
  accounts,
  page,
}) => {
  test.setTimeout(120_000);
  const account = await accounts.create();

  await login(page, account);
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Budgets" })
    .click();
  await expect(page.getByText("Aucun budget configuré")).toBeVisible();

  const createForm = formForButton(page, "Ajouter ce budget");
  await createForm.getByLabel("Catégorie").selectOption("Shopping");
  await createForm.getByLabel("Plafond mensuel").fill("100,00");
  await createForm.getByRole("button", { name: "Ajouter ce budget" }).click();
  await expect(createForm.getByRole("status")).toContainText("a été ajouté");
  await expect(budgetRow(page, "Shopping")).toContainText(/0,00\s*€\s*sur\s*100,00\s*€/);

  await createTransaction(page, "40,00", "Shopping 40 E2E");
  await page.getByRole("link", { name: "Budgets" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText(/40,00\s*€\s*sur\s*100,00\s*€/);
  await expect(budgetRow(page, "Shopping").getByText("Dans le budget")).toBeVisible();

  await createTransaction(page, "35,00", "Shopping 35 E2E");
  await page.getByRole("link", { name: "Budgets" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText("75 % consommé");
  await expect(budgetRow(page, "Shopping").getByText("Proche", { exact: true })).toBeVisible();

  await createTransaction(page, "30,00", "Shopping 30 E2E");
  await page.getByRole("link", { name: "Budgets" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText("105 % consommé");
  await expect(budgetRow(page, "Shopping")).toContainText(
    /5,00\s*€\s*de dépassement/,
  );
  await expect(budgetRow(page, "Shopping").getByText("Dépassé", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(
    page.getByRole("heading", { name: "Budgets à surveiller" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { exact: true, name: "Shopping" }),
  ).toBeVisible();
  await expect(page.getByText("Budget dépassé")).toBeVisible();
  await expect(page.getByText(/Dépassé de 5,00\s*€/)).toBeVisible();

  await page
    .getByRole("link", { exact: true, name: "Vérifier un achat" })
    .click();
  await page.getByLabel("Nom de l’achat").fill("Achat catégorie E2E");
  await page.getByLabel("Prix").fill("10,00");
  await page.getByRole("button", { name: "Vérifier cet achat" }).click();
  await page.getByRole("button", { name: "Ajouter comme transaction" }).click();
  const confirmation = formForButton(page, "Confirmer l’ajout");
  await confirmation.getByLabel("Catégorie").selectOption("Shopping");
  await expect(confirmation).toContainText(/de 105,00\s*€ \/ 100,00\s*€ à 115,00\s*€ \/ 100,00\s*€/);
  await confirmation.getByRole("button", { name: "Annuler" }).click();

  await page.getByRole("link", { name: "Transactions" }).click();
  await listRow(page, "Shopping 30 E2E").getByRole("button", { name: "Modifier" }).click();
  const editTransaction = formForButton(page, "Enregistrer les modifications");
  await editTransaction.getByLabel("Catégorie").selectOption("Transport");
  await editTransaction.getByRole("button", { name: "Enregistrer les modifications" }).click();
  await editTransaction.getByRole("button", { name: "Annuler" }).click();

  await page.getByRole("link", { name: "Budgets" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText("75 % consommé");
  await expect(budgetRow(page, "Shopping").getByText("Proche", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Transactions" }).click();
  await listRow(page, "Shopping 35 E2E").getByRole("button", { name: "Supprimer" }).click();
  await listRow(page, "Shopping 35 E2E").getByRole("button", { name: "Confirmer la suppression" }).click();
  await page.getByRole("link", { name: "Budgets" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText(/40,00\s*€\s*sur\s*100,00\s*€/);

  await page.getByRole("link", { name: "Mois précédent" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText(/0,00\s*€\s*sur\s*100,00\s*€/);
  await page.getByRole("link", { name: "Mois actuel" }).click();

  await budgetRow(page, "Shopping").getByRole("button", { name: "Modifier" }).click();
  const editBudget = formForButton(page, "Enregistrer le plafond");
  await editBudget.getByLabel("Plafond mensuel").fill("120,00");
  await editBudget.getByRole("button", { name: "Enregistrer le plafond" }).click();
  await editBudget.getByRole("button", { name: "Annuler" }).click();
  await expect(budgetRow(page, "Shopping")).toContainText(/40,00\s*€\s*sur\s*120,00\s*€/);

  await budgetRow(page, "Shopping").getByRole("button", { name: "Supprimer" }).click();
  await budgetRow(page, "Shopping").getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(page.getByText("Aucun budget configuré")).toBeVisible();
});
