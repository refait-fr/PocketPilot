import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import {
  dashboardMetric,
  expectDashboard,
  listRow,
  login,
} from "./support/ui";

function formForButton(page: Page, buttonName: string): Locator {
  return page
    .getByRole("button", { exact: true, name: buttonName })
    .locator("xpath=ancestor::form");
}

function availableBudget(page: Page): Locator {
  return page
    .locator("section")
    .filter({ hasText: "Reste réel aujourd’hui" })
    .first();
}

function dashboardAmount(page: Page, label: string): Locator {
  return page.getByText(label, { exact: true }).locator("..");
}

test("le parcours financier CRUD reste cohérent avec le dashboard", async ({
  accounts,
  page,
}) => {
  test.setTimeout(120_000);
  const account = await accounts.create();

  await login(page, account);
  await expectDashboard(page);
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    "Aucun revenu récurrent enregistré.",
  );
  await expect(dashboardMetric(page, "Dépenses fixes")).toContainText(
    "Aucune dépense fixe enregistrée.",
  );
  await expect(dashboardMetric(page, "Objectifs actifs")).toContainText(
    "Aucun objectif d’épargne enregistré.",
  );

  await page.getByRole("link", { name: "Revenus" }).click();
  const incomeCreateForm = formForButton(page, "Ajouter ce revenu");
  await incomeCreateForm.getByLabel("Libellé").fill("Salaire E2E");
  await incomeCreateForm.getByLabel("Montant mensuel").fill("montant invalide");
  await incomeCreateForm
    .getByRole("button", { name: "Ajouter ce revenu" })
    .click();
  await expect(incomeCreateForm.getByRole("alert")).toContainText(
    "Corrigez les champs indiqués.",
  );
  await expect(incomeCreateForm.getByLabel("Libellé")).toHaveValue(
    "Salaire E2E",
  );
  await expect(incomeCreateForm.getByText(/montant numérique/i)).toBeVisible();

  await incomeCreateForm.getByLabel("Montant mensuel").fill("1100,00");
  await incomeCreateForm
    .getByRole("button", { name: "Ajouter ce revenu" })
    .click();
  await expect(incomeCreateForm.getByRole("status")).toContainText(
    "Le revenu a été ajouté",
  );
  await expect(incomeCreateForm.getByLabel("Libellé")).toHaveValue("");
  await expect(incomeCreateForm.getByLabel("Montant mensuel")).toHaveValue("");
  await expect(listRow(page, "Salaire E2E")).toContainText(/1\s*100,00\s*€/);

  await listRow(page, "Salaire E2E")
    .getByRole("button", { name: "Modifier" })
    .click();
  const incomeEditForm = formForButton(page, "Enregistrer les modifications");
  await incomeEditForm.getByLabel("Libellé").fill("Salaire principal E2E");
  await incomeEditForm.getByLabel("Montant mensuel").fill("1200,00");
  await incomeEditForm
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(incomeEditForm.getByRole("status")).toContainText(
    "Les modifications sont enregistrées.",
  );
  await incomeEditForm.getByRole("button", { name: "Annuler" }).click();
  await expect(listRow(page, "Salaire principal E2E")).toContainText(
    /1\s*200,00\s*€/,
  );

  await listRow(page, "Salaire principal E2E")
    .getByRole("button", { name: "Désactiver" })
    .click();
  await expect(
    listRow(page, "Salaire principal E2E").getByText("En pause"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    "Votre revenu récurrent est désactivé.",
  );
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    /0,00\s*€/,
  );

  await page.getByRole("link", { name: "Revenus" }).click();
  await listRow(page, "Salaire principal E2E")
    .getByRole("button", { name: "Activer" })
    .click();
  await expect(
    listRow(page, "Salaire principal E2E").getByText("Actif", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    /1\s*200,00\s*€/,
  );

  await page.getByRole("link", { name: "Dépenses" }).click();
  const expenseCreateForm = formForButton(page, "Ajouter cette dépense");
  await expenseCreateForm.getByLabel("Libellé").fill("Loyer E2E");
  await expenseCreateForm.getByLabel("Montant mensuel").fill("400,00");
  await expenseCreateForm
    .getByRole("button", { name: "Ajouter cette dépense" })
    .click();
  await expect(expenseCreateForm.getByRole("status")).toContainText(
    "La dépense a été ajoutée",
  );
  await expect(expenseCreateForm.getByLabel("Libellé")).toHaveValue("");
  await expect(expenseCreateForm.getByLabel("Montant mensuel")).toHaveValue("");

  await listRow(page, "Loyer E2E")
    .getByRole("button", { name: "Modifier" })
    .click();
  const expenseEditForm = formForButton(page, "Enregistrer les modifications");
  await expenseEditForm.getByLabel("Libellé").fill("Loyer principal E2E");
  await expenseEditForm.getByLabel("Montant mensuel").fill("450,00");
  await expenseEditForm
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(expenseEditForm.getByRole("status")).toContainText(
    "Les modifications sont enregistrées.",
  );
  await expenseEditForm.getByRole("button", { name: "Annuler" }).click();

  await listRow(page, "Loyer principal E2E")
    .getByRole("button", { name: "Désactiver" })
    .click();
  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardMetric(page, "Dépenses fixes")).toContainText(
    "Votre dépense fixe est désactivée.",
  );
  await expect(availableBudget(page)).toContainText(/1\s*200,00\s*€/);

  await page.getByRole("link", { name: "Dépenses" }).click();
  await listRow(page, "Loyer principal E2E")
    .getByRole("button", { name: "Activer" })
    .click();
  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardMetric(page, "Dépenses fixes")).toContainText(
    /450,00\s*€/,
  );
  await expect(availableBudget(page)).toContainText(/750,00\s*€/);

  await page.getByRole("link", { name: "Objectifs" }).click();
  const goalCreateForm = formForButton(page, "Créer cet objectif");
  await goalCreateForm.getByLabel("Nom de l’objectif").fill("Voyage E2E");
  await goalCreateForm
    .getByRole("textbox", { name: /^Montant cible\b/ })
    .fill("1000,00");
  await goalCreateForm
    .getByRole("textbox", { name: /^Déjà épargné/ })
    .fill("0,00");
  await goalCreateForm
    .getByRole("textbox", { name: /^Allocation mensuelle\b/ })
    .fill("200,00");
  await goalCreateForm
    .getByRole("button", { name: "Créer cet objectif" })
    .click();
  await expect(goalCreateForm.getByRole("status")).toContainText(
    "L’objectif a été ajouté",
  );
  await expect(goalCreateForm.getByLabel("Nom de l’objectif")).toHaveValue("");
  await expect(
    goalCreateForm.getByRole("textbox", { name: /^Montant cible\b/ }),
  ).toHaveValue("");
  await expect(
    goalCreateForm.getByRole("textbox", { name: /^Déjà épargné/ }),
  ).toHaveValue("0,00");
  await expect(
    goalCreateForm.getByRole("textbox", { name: /^Allocation mensuelle\b/ }),
  ).toHaveValue("0,00");

  let goalRow = listRow(page, "Voyage E2E");
  await expect(goalRow.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(goalRow).toContainText(/1\s*000,00\s*€/);
  await expect(goalRow).toContainText(/5 mois/);

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardAmount(page, "Budget disponible")).toContainText(
    /550,00\s*€/,
  );
  await expect(dashboardAmount(page, "Dépensé ce mois")).toContainText(
    /0,00\s*€/,
  );
  await expect(availableBudget(page)).toContainText(/550,00\s*€/);

  await page.getByRole("link", { name: "Transactions" }).click();
  const transactionCreateForm = formForButton(page, "Ajouter la transaction");
  const defaultTransactionDate = await transactionCreateForm
    .getByLabel("Date")
    .inputValue();
  await transactionCreateForm.getByLabel("Montant").fill("137,00");
  await transactionCreateForm.getByLabel("Catégorie").selectOption("Alimentation");
  await transactionCreateForm.getByLabel(/Description/).fill("Courses E2E");
  await transactionCreateForm
    .getByRole("button", { name: "Ajouter la transaction" })
    .click();
  await expect(transactionCreateForm.getByRole("status")).toContainText(
    "La transaction a été ajoutée",
  );
  await expect(transactionCreateForm.getByLabel("Montant")).toHaveValue("");
  await expect(transactionCreateForm.getByLabel(/Description/)).toHaveValue("");
  await expect(transactionCreateForm.getByLabel("Date")).toHaveValue(
    defaultTransactionDate,
  );
  await expect(listRow(page, "Courses E2E")).toContainText(/137,00\s*€/);
  await expect(page.getByRole("heading", { name: /Dépensé : 137,00\s*€/ })).toBeVisible();

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardAmount(page, "Budget disponible")).toContainText(
    /550,00\s*€/,
  );
  await expect(dashboardAmount(page, "Dépensé ce mois")).toContainText(
    /137,00\s*€/,
  );
  await expect(availableBudget(page)).toContainText(/413,00\s*€/);

  await page.getByRole("link", { name: "Vérifier un achat" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Est-ce que cet achat rentre dans votre mois ?",
    }),
  ).toBeVisible();
  await page.getByLabel("Nom de l’achat").fill("Casque E2E");
  await page.getByLabel("Prix").fill("80,00");
  await page.getByRole("button", { name: "Vérifier cet achat" }).click();
  await expect(page.getByText("Achat confortable", { exact: true })).toBeVisible();
  await expect(page.getByText("Reste après achat").locator("..")).toContainText(
    /333,00\s*€/,
  );

  await page.getByLabel("Prix").fill("350,00");
  await page.getByRole("button", { name: "Vérifier cet achat" }).click();
  await expect(page.getByText("Budget serré", { exact: true })).toBeVisible();
  await expect(page.getByText("Reste après achat").locator("..")).toContainText(
    /63,00\s*€/,
  );

  await page.getByLabel("Prix").fill("500,00");
  await page.getByRole("button", { name: "Vérifier cet achat" }).click();
  await expect(page.getByText("Dépassement", { exact: true })).toBeVisible();
  await expect(page.getByText("Reste après achat").locator("..")).toContainText(
    /-87,00\s*€/,
  );

  await page.getByLabel("Prix").fill("80,00");
  await page.getByRole("button", { name: "Vérifier cet achat" }).click();
  await page.getByRole("button", { name: "Ajouter comme transaction" }).click();
  const purchaseConfirmation = formForButton(page, "Confirmer l’ajout");
  await purchaseConfirmation.getByLabel("Catégorie").selectOption("Shopping");
  await purchaseConfirmation.getByRole("button", { name: "Confirmer l’ajout" }).click();
  await expect(page.getByRole("status")).toContainText(
    "La transaction a été ajoutée au mois.",
  );
  await page.getByRole("link", { name: "Voir le dashboard" }).click();
  await expect(dashboardAmount(page, "Dépensé ce mois")).toContainText(
    /217,00\s*€/,
  );
  await expect(availableBudget(page)).toContainText(/333,00\s*€/);

  await page.getByRole("link", { name: "Transactions" }).click();
  await listRow(page, "Courses E2E")
    .getByRole("button", { name: "Modifier" })
    .click();
  const transactionEditForm = formForButton(page, "Enregistrer les modifications");
  await transactionEditForm.getByLabel("Montant").fill("140,00");
  await transactionEditForm.getByLabel(/Description/).fill("Courses modifiées E2E");
  await transactionEditForm
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(transactionEditForm.getByRole("status")).toContainText(
    "Les modifications sont enregistrées.",
  );
  await transactionEditForm.getByRole("button", { name: "Annuler" }).click();
  await expect(listRow(page, "Courses modifiées E2E")).toContainText(
    /140,00\s*€/,
  );

  await page.getByRole("link", { name: "Mois précédent" }).click();
  await expect(page.getByRole("heading", { name: /Aucune transaction en/ })).toBeVisible();
  await page.getByRole("link", { name: "Mois actuel" }).click();
  await expect(listRow(page, "Courses modifiées E2E")).toBeVisible();

  await listRow(page, "Courses modifiées E2E")
    .getByRole("button", { name: "Supprimer" })
    .click();
  await listRow(page, "Courses modifiées E2E")
    .getByRole("button", { name: "Confirmer la suppression" })
    .click();
  await listRow(page, "Casque E2E")
    .getByRole("button", { name: "Supprimer" })
    .click();
  await listRow(page, "Casque E2E")
    .getByRole("button", { name: "Confirmer la suppression" })
    .click();
  await expect(page.getByText("Aucune transaction ce mois-ci")).toBeVisible();

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardAmount(page, "Dépensé ce mois")).toContainText(
    /0,00\s*€/,
  );
  await expect(availableBudget(page)).toContainText(/550,00\s*€/);

  await page.getByRole("link", { name: "Objectifs" }).click();

  await goalRow
    .getByRole("button", { name: "Modifier / actualiser" })
    .click();
  let goalEditForm = formForButton(page, "Enregistrer les modifications");
  await goalEditForm
    .getByRole("textbox", { name: /^Déjà épargné/ })
    .fill("950,00");
  await goalEditForm
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(goalEditForm.getByRole("status")).toContainText(
    "L’objectif et son épargne actuelle sont à jour.",
  );
  await goalEditForm.getByRole("button", { name: "Annuler" }).click();
  goalRow = listRow(page, "Voyage E2E");
  await expect(goalRow.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "95",
  );
  await expect(goalRow).toContainText(/50,00\s*€/);
  await expect(goalRow).toContainText(/1 mois/);

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(availableBudget(page)).toContainText(/700,00\s*€/);
  await expect(page.getByText("Épargne prévue").locator("..")).toContainText(
    /50,00\s*€/,
  );
  await expect(dashboardMetric(page, "Objectifs actifs")).toContainText("1");

  await page.getByRole("link", { name: "Objectifs" }).click();
  await listRow(page, "Voyage E2E")
    .getByRole("button", { name: "Modifier / actualiser" })
    .click();
  goalEditForm = formForButton(page, "Enregistrer les modifications");
  await goalEditForm
    .getByRole("textbox", { name: /^Déjà épargné/ })
    .fill("1000,00");
  await goalEditForm
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await goalEditForm.getByRole("button", { name: "Annuler" }).click();
  await expect(
    listRow(page, "Voyage E2E").getByText("Atteint", { exact: true }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(availableBudget(page)).toContainText(/750,00\s*€/);
  await expect(page.getByText("Épargne prévue").locator("..")).toContainText(
    /0,00\s*€/,
  );
  await expect(dashboardMetric(page, "Objectifs actifs")).toContainText(
    "Tous vos objectifs sont atteints.",
  );

  await page.getByRole("link", { name: "Objectifs" }).click();
  await listRow(page, "Voyage E2E")
    .getByRole("button", { name: "Supprimer" })
    .click();
  await listRow(page, "Voyage E2E")
    .getByRole("button", { name: "Confirmer la suppression" })
    .click();
  await expect(page.getByText("Aucun objectif défini")).toBeVisible();

  await page.getByRole("link", { name: "Dépenses" }).click();
  await listRow(page, "Loyer principal E2E")
    .getByRole("button", { name: "Supprimer" })
    .click();
  await listRow(page, "Loyer principal E2E")
    .getByRole("button", { name: "Confirmer la suppression" })
    .click();
  await expect(page.getByText("Aucune dépense enregistrée")).toBeVisible();

  await page.getByRole("link", { name: "Revenus" }).click();
  await listRow(page, "Salaire principal E2E")
    .getByRole("button", { name: "Supprimer" })
    .click();
  await listRow(page, "Salaire principal E2E")
    .getByRole("button", { name: "Confirmer la suppression" })
    .click();
  await expect(page.getByText("Aucun revenu enregistré")).toBeVisible();

  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    "Aucun revenu récurrent enregistré.",
  );
  await expect(dashboardMetric(page, "Dépenses fixes")).toContainText(
    "Aucune dépense fixe enregistrée.",
  );
  await expect(availableBudget(page)).toContainText(/0,00\s*€/);
});
