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
    .filter({ hasText: "Reste mensuel disponible" })
    .first();
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

  await incomeCreateForm.getByLabel("Montant mensuel").fill("2000,00");
  await incomeCreateForm
    .getByRole("button", { name: "Ajouter ce revenu" })
    .click();
  await expect(incomeCreateForm.getByRole("status")).toContainText(
    "Le revenu a été ajouté",
  );
  await expect(incomeCreateForm.getByLabel("Libellé")).toHaveValue("");
  await expect(incomeCreateForm.getByLabel("Montant mensuel")).toHaveValue("");
  await expect(listRow(page, "Salaire E2E")).toContainText(/2\s*000,00\s*€/);

  await listRow(page, "Salaire E2E")
    .getByRole("button", { name: "Modifier" })
    .click();
  const incomeEditForm = formForButton(page, "Enregistrer les modifications");
  await incomeEditForm.getByLabel("Libellé").fill("Salaire principal E2E");
  await incomeEditForm.getByLabel("Montant mensuel").fill("2200,00");
  await incomeEditForm
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(incomeEditForm.getByRole("status")).toContainText(
    "Les modifications sont enregistrées.",
  );
  await incomeEditForm.getByRole("button", { name: "Annuler" }).click();
  await expect(listRow(page, "Salaire principal E2E")).toContainText(
    /2\s*200,00\s*€/,
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
    /2\s*200,00\s*€/,
  );

  await page.getByRole("link", { name: "Dépenses" }).click();
  const expenseCreateForm = formForButton(page, "Ajouter cette dépense");
  await expenseCreateForm.getByLabel("Libellé").fill("Loyer E2E");
  await expenseCreateForm.getByLabel("Montant mensuel").fill("800,00");
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
  await expenseEditForm.getByLabel("Montant mensuel").fill("850,00");
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
  await expect(availableBudget(page)).toContainText(/2\s*200,00\s*€/);

  await page.getByRole("link", { name: "Dépenses" }).click();
  await listRow(page, "Loyer principal E2E")
    .getByRole("button", { name: "Activer" })
    .click();
  await page.getByRole("link", { name: "Vue d’ensemble" }).click();
  await expect(dashboardMetric(page, "Dépenses fixes")).toContainText(
    /850,00\s*€/,
  );
  await expect(availableBudget(page)).toContainText(/1\s*350,00\s*€/);

  await page.getByRole("link", { name: "Objectifs" }).click();
  const goalCreateForm = formForButton(page, "Créer cet objectif");
  await goalCreateForm.getByLabel("Nom de l’objectif").fill("Voyage E2E");
  await goalCreateForm
    .getByRole("textbox", { name: /^Montant cible\b/ })
    .fill("1000,00");
  await goalCreateForm
    .getByRole("textbox", { name: /^Déjà épargné/ })
    .fill("900,00");
  await goalCreateForm
    .getByRole("textbox", { name: /^Allocation mensuelle\b/ })
    .fill("100,00");
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
    "90",
  );
  await expect(goalRow).toContainText(/100,00\s*€/);
  await expect(goalRow).toContainText(/1 mois/);

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
  await expect(availableBudget(page)).toContainText(/1\s*300,00\s*€/);
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
  await expect(availableBudget(page)).toContainText(/1\s*350,00\s*€/);
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
