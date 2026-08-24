import { expect, test } from "./fixtures";
import { dashboardMetric, listRow, login } from "./support/ui";

test("un utilisateur ne voit jamais les données financières d’un autre", async ({
  accounts,
  page,
}) => {
  const accountA = await accounts.create();
  const accountB = await accounts.create();
  const privateLabel = `Revenu privé ${accountA.id.slice(0, 8)}`;

  await login(page, accountA);
  await page.getByRole("link", { name: "Revenus" }).click();
  const createForm = page
    .getByRole("button", { name: "Ajouter ce revenu" })
    .locator("xpath=ancestor::form");
  await createForm.getByLabel("Libellé").fill(privateLabel);
  await createForm.getByLabel("Montant mensuel").fill("1234,56");
  await createForm.getByRole("button", { name: "Ajouter ce revenu" }).click();
  await expect(listRow(page, privateLabel)).toBeVisible();

  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/auth\?notice=signed-out$/);
  await login(page, accountB);
  await expect(dashboardMetric(page, "Revenus mensuels")).toContainText(
    "Aucun revenu récurrent enregistré.",
  );
  await page.getByRole("link", { name: "Revenus" }).click();
  await expect(page.getByText("Aucun revenu enregistré")).toBeVisible();
  await expect(page.getByText(privateLabel)).toHaveCount(0);
});
