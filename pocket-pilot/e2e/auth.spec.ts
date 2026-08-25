import { readE2EEnvironment } from "./support/environment";
import {
  deleteCapturedEmail,
  findAuthEmailLink,
  type CapturedEmailLink,
} from "./support/mailpit";
import { expect, test } from "./fixtures";
import { completeOnboarding, expectDashboard } from "./support/ui";

const environment = readE2EEnvironment();

test("inscription, confirmation, onboarding, déconnexion et reconnexion", async ({
  accounts,
  page,
}) => {
  const credentials = accounts.uniqueCredentials();

  await page.goto("/auth");
  await expect(
    page.getByRole("heading", {
      name: "Connexion à PocketPilot",
    }),
  ).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Connexion" })).toBeFocused();

  await page.getByRole("button", { name: "Inscription" }).click();
  await page.getByLabel("Adresse email").fill(credentials.email);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill(credentials.password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page.getByRole("status")).toContainText(
    "Un email de confirmation vient de partir.",
  );
  accounts.trackSignup(credentials.email);
  let capturedEmail: CapturedEmailLink | undefined;

  await expect
    .poll(
      async () => {
        capturedEmail = await findAuthEmailLink(
          environment.mailpitUrl,
          credentials.email,
          "confirmation",
        );
        return Boolean(capturedEmail);
      },
      {
        message: "attendre l’email de confirmation dans Mailpit",
        timeout: 20_000,
      },
    )
    .toBe(true);

  if (!capturedEmail) {
    throw new Error("Le lien de confirmation Mailpit est introuvable.");
  }

  try {
    await page.goto(capturedEmail.url);
    await completeOnboarding(page);
  } finally {
    await deleteCapturedEmail(environment.mailpitUrl, capturedEmail.messageId);
  }

  await expect(
    page
      .getByRole("link", { name: /Ouvrir les paramètres du profil/ })
      .getByText("EUR", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Aucun revenu récurrent enregistré.")).toBeVisible();
  await expect(page.getByText("Aucune dépense fixe enregistrée.")).toBeVisible();
  await expect(page.getByText("Aucun objectif d’épargne enregistré.")).toBeVisible();

  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/auth\?notice=signed-out$/);
  await expect(page.getByRole("status")).toHaveText("Vous êtes déconnecté.");

  await page.getByLabel("Adresse email").fill(credentials.email);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill(credentials.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expectDashboard(page);
});
