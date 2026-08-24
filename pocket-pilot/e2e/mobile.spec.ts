import { expect, test } from "./fixtures";
import {
  expectDashboard,
  expectNoHorizontalOverflow,
  listRow,
  login,
} from "./support/ui";

test("les parcours essentiels restent utilisables en 390 × 844", async ({
  accounts,
  page,
}) => {
  const account = await accounts.create();

  await page.goto("/auth");
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Connexion" })).toBeFocused();

  await login(page, account);
  await expectDashboard(page);
  await expectNoHorizontalOverflow(page);

  const navigation = page.getByRole("navigation", {
    name: "Navigation principale",
  });
  for (const label of [
    "Vue d’ensemble",
    "Revenus",
    "Dépenses",
    "Transactions",
    "Budgets",
    "Objectifs",
    "Réglages",
  ]) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }

  await navigation.getByRole("link", { name: "Revenus" }).click();
  await expectNoHorizontalOverflow(page);
  const createForm = page
    .getByRole("button", { name: "Ajouter ce revenu" })
    .locator("xpath=ancestor::form");
  await createForm.getByLabel("Libellé").fill("Revenu mobile E2E");
  await createForm.getByLabel("Montant mensuel").fill("325,50");
  const submitButton = createForm.getByRole("button", {
    name: "Ajouter ce revenu",
  });
  await submitButton.scrollIntoViewIfNeeded();
  await expect(submitButton).toBeInViewport();
  await submitButton.click();
  await expect(listRow(page, "Revenu mobile E2E")).toBeVisible();
  await expect(
    listRow(page, "Revenu mobile E2E").getByRole("button", {
      name: "Supprimer",
    }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await navigation.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expectDashboard(page);
  await expectNoHorizontalOverflow(page);

  await navigation.getByRole("link", { name: "Transactions" }).click();
  await expectNoHorizontalOverflow(page);
  const transactionForm = page
    .getByRole("button", { name: "Ajouter la transaction" })
    .locator("xpath=ancestor::form");
  await transactionForm.getByLabel("Montant").fill("18,50");
  await transactionForm.getByLabel("Catégorie").selectOption("Transport");
  await transactionForm.getByLabel(/Description/).fill("Métro mobile E2E");
  const transactionSubmit = transactionForm.getByRole("button", {
    name: "Ajouter la transaction",
  });
  await transactionSubmit.scrollIntoViewIfNeeded();
  await expect(transactionSubmit).toBeInViewport();
  await transactionSubmit.click();
  await expect(listRow(page, "Métro mobile E2E")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await navigation.getByRole("link", { name: "Budgets" }).click();
  await expectNoHorizontalOverflow(page);
  const budgetForm = page
    .getByRole("button", { name: "Ajouter ce budget" })
    .locator("xpath=ancestor::form");
  await budgetForm.getByLabel("Catégorie").selectOption("Transport");
  await budgetForm.getByLabel("Plafond mensuel").fill("100,00");
  const budgetSubmit = budgetForm.getByRole("button", { name: "Ajouter ce budget" });
  await budgetSubmit.scrollIntoViewIfNeeded();
  await expect(budgetSubmit).toBeInViewport();
  await budgetSubmit.click();
  const transportBudget = page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "Transport", exact: true }),
  });
  await expect(transportBudget).toContainText(/18,50\s*€\s*\/\s*100,00\s*€/);
  await expect(transportBudget.getByRole("button", { name: "Modifier" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await navigation.getByRole("link", { name: "Vue d’ensemble" }).click();
  const purchaseCheckerLink = page.getByRole("link", {
    name: "Vérifier un achat",
  });
  await purchaseCheckerLink.scrollIntoViewIfNeeded();
  await expect(purchaseCheckerLink).toBeInViewport();
  await purchaseCheckerLink.click();
  await expectNoHorizontalOverflow(page);
  await page.getByLabel("Nom de l’achat").fill("Livre mobile E2E");
  await page.getByLabel("Prix").fill("20,00");
  const checkPurchaseButton = page.getByRole("button", {
    name: "Vérifier cet achat",
  });
  await checkPurchaseButton.scrollIntoViewIfNeeded();
  await expect(checkPurchaseButton).toBeInViewport();
  await checkPurchaseButton.click();
  await expect(page.getByText("Achat confortable", { exact: true })).toBeVisible();
  await expect(page.getByText("Reste après achat").locator("..")).toContainText(
    /287,00\s*€/,
  );
  await expect(
    page.getByRole("button", { name: "Ajouter comme transaction" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
