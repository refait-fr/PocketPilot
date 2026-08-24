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
});
