import { readE2EEnvironment } from "./support/environment";
import {
  deleteCapturedEmail,
  findAuthEmailLink,
  type CapturedEmailLink,
} from "./support/mailpit";
import { expect, test } from "./fixtures";
import { expectDashboard, login } from "./support/ui";

const environment = readE2EEnvironment();
const neutralRecoveryMessage =
  "Si un compte correspond à cette adresse, un lien de réinitialisation sera envoyé.";

async function requestRecovery(page: Parameters<typeof login>[0], email: string) {
  await page.goto("/auth/forgot-password");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByRole("button", { name: "Recevoir le lien" }).click();
  await expect(page.getByRole("status")).toHaveText(neutralRecoveryMessage);
}

test("la demande de récupération garde un message neutre", async ({
  accounts,
  page,
}) => {
  const knownAccount = await accounts.create({ withProfile: false });
  const unknownCredentials = accounts.uniqueCredentials();

  await requestRecovery(page, knownAccount.email);
  await requestRecovery(page, unknownCredentials.email);
});

test("un lien Mailpit permet de choisir puis utiliser un nouveau mot de passe", async ({
  accounts,
  page,
}) => {
  const account = await accounts.create();
  const newPassword = `New-${account.password}`;
  let capturedEmail: CapturedEmailLink | undefined;

  await requestRecovery(page, account.email);
  await expect
    .poll(
      async () => {
        capturedEmail = await findAuthEmailLink(
          environment.mailpitUrl,
          account.email,
          "recovery",
        );
        return Boolean(capturedEmail);
      },
      {
        message: "attendre l’email de récupération dans Mailpit",
        timeout: 20_000,
      },
    )
    .toBe(true);

  if (!capturedEmail) {
    throw new Error("Le lien de récupération Mailpit est introuvable.");
  }

  try {
    await page.goto(capturedEmail.url);
    await expect(
      page.getByRole("heading", { name: "Sécuriser à nouveau votre compte." }),
    ).toBeVisible();
    await page
      .getByLabel("Nouveau mot de passe", { exact: true })
      .fill(newPassword);
    await page
      .getByLabel("Confirmer le nouveau mot de passe")
      .fill(newPassword);
    await page
      .getByRole("button", { name: "Mettre à jour le mot de passe" })
      .click();
    await expect(page.getByRole("status")).toHaveText(
      "Votre mot de passe a été mis à jour.",
    );
    await page
      .getByRole("link", { name: "Retourner dans PocketPilot" })
      .click();
    await expectDashboard(page);

    await page.getByRole("button", { name: "Déconnexion" }).click();
    await expect(page).toHaveURL(/\/auth\?notice=signed-out$/);
    await login(page, { ...account, password: newPassword });
    await expectDashboard(page);
  } finally {
    await deleteCapturedEmail(environment.mailpitUrl, capturedEmail.messageId);
  }
});
