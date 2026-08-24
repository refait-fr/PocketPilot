import { expect, test } from "./fixtures";
import { dashboardMetric, listRow, login } from "./support/ui";

test("un utilisateur ne voit jamais les données financières d’un autre", async ({
  accounts,
  page,
}) => {
  const accountA = await accounts.create();
  const accountB = await accounts.create();
  const privateLabel = `Revenu privé ${accountA.id.slice(0, 8)}`;
  const privateTransaction = `Transaction privée ${accountA.id.slice(0, 8)}`;

  await login(page, accountA);
  await page.getByRole("link", { exact: true, name: "Revenus" }).click();
  const createForm = page
    .getByRole("button", { name: "Ajouter ce revenu" })
    .locator("xpath=ancestor::form");
  await createForm.getByLabel("Libellé").fill(privateLabel);
  await createForm.getByLabel("Montant mensuel").fill("1234,56");
  await createForm.getByRole("button", { name: "Ajouter ce revenu" }).click();
  await expect(listRow(page, privateLabel)).toBeVisible();

  await page.getByRole("link", { exact: true, name: "Transactions" }).click();
  const transactionForm = page
    .getByRole("button", { name: "Ajouter la transaction" })
    .locator("xpath=ancestor::form");
  await transactionForm.getByLabel("Montant").fill("42,00");
  await transactionForm.getByLabel("Catégorie").selectOption("Autre");
  await transactionForm.getByLabel(/Description/).fill(privateTransaction);
  await transactionForm
    .getByRole("button", { name: "Ajouter la transaction" })
    .click();
  await expect(listRow(page, privateTransaction)).toBeVisible();

  await page.getByRole("link", { exact: true, name: "Budgets" }).click();
  const budgetForm = page
    .getByRole("button", { name: "Ajouter ce budget" })
    .locator("xpath=ancestor::form");
  await budgetForm.getByLabel("Catégorie").selectOption("Shopping");
  await budgetForm.getByLabel("Plafond mensuel").fill("100,00");
  await budgetForm.getByRole("button", { name: "Ajouter ce budget" }).click();
  await expect(page.getByRole("heading", { name: "Shopping", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/auth\?notice=signed-out$/);
  await login(page, accountB);
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    "Aucun revenu récurrent enregistré.",
  );
  await expect(dashboardMetric(page, "Dépenses ponctuelles")).toContainText(
    "Aucune transaction enregistrée ce mois-ci.",
  );
  await page.getByRole("link", { exact: true, name: "Revenus" }).click();
  await expect(page.getByText("Aucun revenu enregistré")).toBeVisible();
  await expect(page.getByText(privateLabel)).toHaveCount(0);
  await page.getByRole("link", { exact: true, name: "Transactions" }).click();
  await expect(page.getByText("Aucune transaction ce mois-ci")).toBeVisible();
  await expect(page.getByText(privateTransaction)).toHaveCount(0);
  await page.getByRole("link", { exact: true, name: "Budgets" }).click();
  await expect(page.getByText("Aucun budget configuré")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shopping", exact: true })).toHaveCount(0);
});
