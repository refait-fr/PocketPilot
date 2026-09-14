import { expect, test } from "./fixtures";
import { login } from "./support/ui";

test("les cinq fonctionnalités câblées restent utilisables", async ({
  accounts,
  page,
}) => {
  test.setTimeout(180_000);
  const account = await accounts.create();

  await login(page, account);

  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Projection" })
    .click();
  await expect(page.getByRole("heading", { name: "Projection" })).toBeVisible();
  await expect(page.getByText("Hypothèses de calcul")).toBeVisible();
  await page.getByLabel("Horizon projeté").selectOption("6");
  await page.getByRole("button", { name: "Afficher" }).click();
  await expect(page.getByText("Aucun plan à projeter")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Paramètres" })
    .click();
  const exportLink = page.getByRole("link", { name: "Exporter mes données (CSV)" });
  await expect(exportLink).toBeVisible();
  await expect(exportLink).toHaveAttribute("href", "/settings/export");

  const categoryForm = page
    .getByRole("button", { name: "Ajouter la catégorie" })
    .locator("xpath=ancestor::form");
  await categoryForm.getByLabel("Nouvelle catégorie").fill("Cadeaux E2E");
  await categoryForm.getByRole("button", { name: "Ajouter la catégorie" }).click();
  await expect(page.getByText("La catégorie Cadeaux E2E a été ajoutée.")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Transactions" })
    .click();
  await expect(page.getByRole("link", { name: "Importer un fichier CSV" })).toHaveAttribute(
    "href",
    "/transactions/importer",
  );

  await page.getByRole("link", { name: "Importer un fichier CSV" }).click();
  await expect(page.getByRole("heading", { name: "Importer des transactions" })).toBeVisible();
  await expect(page.getByText("Un fichier CSV au format PocketPilot")).toBeVisible();

  const today = new Date().toISOString().slice(0, 10);
  await page.locator('input[type="file"]').setInputFiles({
    buffer: Buffer.from(
      `date;label;montant;categorie\n${today};Cadeau E2E;12,00;Cadeaux E2E\n2026-02-30;Impossible E2E;10,00;Autre\n`,
      "utf-8",
    ),
    mimeType: "text/csv",
    name: "import-e2e.csv",
  });
  await page.getByRole("button", { name: "Analyser le fichier" }).click();
  await expect(page.getByText(/prête à importer/)).toBeVisible();
  await expect(page.getByText(/Ligne 3 :/)).toBeVisible();
  await page.getByRole("button", { name: /Confirmer l’import/ }).click();
  await expect(page.getByText(/1 transaction importée/)).toBeVisible();

  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Budgets" })
    .click();
  const budgetForm = page
    .getByRole("button", { name: "Ajouter ce budget" })
    .locator("xpath=ancestor::form");
  await budgetForm.getByLabel("Catégorie").selectOption("Cadeaux E2E");
  await budgetForm.getByLabel("Plafond mensuel").fill("50,00");
  await budgetForm.getByRole("button", { name: "Ajouter ce budget" }).click();
  await expect(page.getByText("Le budget mensuel a été ajouté.")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Paramètres" })
    .click();
  const customRow = page.getByRole("listitem").filter({ hasText: "Cadeaux E2E" }).last();
  await customRow.getByRole("button", { name: "Supprimer" }).click();
  await customRow.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(customRow.getByText(/est utilisée par/)).toBeVisible();
});
