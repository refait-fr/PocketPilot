import { expect, test } from "./fixtures";
import { readE2EEnvironment } from "./support/environment";
import {
  deleteCapturedEmail,
  findAuthEmailLink,
  type CapturedEmailLink,
} from "./support/mailpit";
import {
  expectDashboard,
  expectNoHorizontalOverflow,
  listRow,
  login,
} from "./support/ui";

const privatePages = [
  { name: "dashboard", path: "/", title: "Bonjour !" },
  {
    name: "transactions",
    path: "/transactions",
    title: "Transactions",
  },
  {
    name: "budgets",
    path: "/budgets",
    title: "Budgets par catégorie",
  },
  {
    name: "purchase-checker",
    path: "/purchase-checker",
    title: "Purchase Checker",
  },
  {
    name: "incomes",
    path: "/incomes",
    title: "Revenus récurrents",
  },
  {
    name: "expenses",
    path: "/expenses",
    title: "Charges fixes",
  },
  {
    name: "goals",
    path: "/goals",
    title: "Objectifs d’épargne",
  },
  {
    name: "settings",
    path: "/settings",
    title: "Paramètres",
  },
] as const;

test.setTimeout(180_000);
const environment = readE2EEnvironment();

async function prepareVisualCapture(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.setProperty("scroll-behavior", "auto", "important");
    document.documentElement.scrollLeft = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollLeft = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ left: 0, top: 0 });
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    document.documentElement.style.setProperty("scroll-behavior", previousScrollBehavior);
  });
  await expect
    .poll(() => page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })))
    .toEqual({ x: 0, y: 0 });
}

async function createVisualFixtures(page: import("@playwright/test").Page) {
  await page.goto("/incomes");
  const incomeForm = page
    .getByRole("button", { name: "Ajouter ce revenu" })
    .locator("xpath=ancestor::form");
  await incomeForm.getByLabel("Libellé").fill("Alternance");
  await incomeForm.getByLabel("Montant mensuel").fill("1450,00");
  await incomeForm.getByRole("button", { name: "Ajouter ce revenu" }).click();
  await expect(listRow(page, "Alternance")).toBeVisible();

  await page.goto("/expenses");
  const expenseForm = page
    .getByRole("button", { name: "Ajouter cette dépense" })
    .locator("xpath=ancestor::form");
  await expenseForm.getByLabel("Libellé").fill("Loyer");
  await expenseForm.getByLabel("Montant mensuel").fill("620,00");
  await expenseForm
    .getByRole("button", { name: "Ajouter cette dépense" })
    .click();
  await expect(listRow(page, "Loyer")).toBeVisible();

  await page.goto("/transactions");
  const transactionForm = page
    .getByRole("button", { name: "Ajouter la transaction" })
    .locator("xpath=ancestor::form");
  await transactionForm.getByLabel("Montant").fill("72,00");
  await transactionForm.getByLabel("Catégorie").selectOption("Shopping");
  await transactionForm.getByLabel(/Description/).fill("Chaussures");
  await transactionForm
    .getByRole("button", { name: "Ajouter la transaction" })
    .click();
  await expect(listRow(page, "Chaussures")).toBeVisible();

  await page.goto("/budgets");
  const budgetForm = page
    .getByRole("button", { name: "Ajouter ce budget" })
    .locator("xpath=ancestor::form");
  await budgetForm.getByLabel("Catégorie").selectOption("Shopping");
  await budgetForm.getByLabel("Plafond mensuel").fill("100,00");
  await budgetForm.getByRole("button", { name: "Ajouter ce budget" }).click();
  await expect(listRow(page, "Shopping")).toBeVisible();

  await page.goto("/goals");
  const goalForm = page
    .getByRole("button", { name: "Créer cet objectif" })
    .locator("xpath=ancestor::form");
  await goalForm.getByLabel("Nom de l’objectif").fill("Voyage au Portugal");
  await goalForm.locator('input[name="targetAmount"]').fill("1200,00");
  await goalForm.locator('input[name="currentAmount"]').fill("420,00");
  await goalForm.locator('input[name="monthlyAllocation"]').fill("130,00");
  await goalForm.getByRole("button", { name: "Créer cet objectif" }).click();
  await expect(listRow(page, "Voyage au Portugal")).toBeVisible();
}

test("les pages principales restent cohérentes dans le viewport de référence", async ({
  accounts,
  page,
}, testInfo) => {
  const account = await accounts.create();
  const viewportName = testInfo.project.name;

  await page.goto("/auth");
  await expect(page.getByRole("heading", { name: "Connexion à PocketPilot" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await prepareVisualCapture(page);
  await page.screenshot({
    fullPage: false,
    path: testInfo.outputPath(`${viewportName}-auth.png`),
  });

  await login(page, account);
  await expectDashboard(page);
  await createVisualFixtures(page);

  for (const privatePage of privatePages) {
    await page.goto(privatePage.path);
    await expect(
      page.getByRole("heading", {
        exact: true,
        level: 1,
        name: privatePage.title,
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (privatePage.name === "dashboard") {
      await expect(
        page.getByRole("img", { name: "Évolution du reste réel pendant le mois" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Transactions récentes" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Objectif principal" }),
      ).toBeVisible();
      await expect(page.getByText("Chaussures", { exact: true })).toBeVisible();
    }
    await prepareVisualCapture(page);
    await page.screenshot({
      fullPage: false,
      path: testInfo.outputPath(`${viewportName}-${privatePage.name}.png`),
    });

    if (privatePage.name === "dashboard") {
      const chartScrubber = page.getByRole("slider", {
        name: "Explorer le solde quotidien",
      });
      await chartScrubber.press("Home");
      await expect(page.getByRole("status")).toContainText("Jour 1");
    }

    if (privatePage.name === "purchase-checker") {
      await page.getByLabel("Nom de l’achat").fill("Casque audio");
      await page.getByLabel("Prix").fill("149,00");
      await page.getByRole("button", { name: "Vérifier cet achat" }).click();
      await expect(page.getByText("Reste après achat")).toBeVisible();
      await prepareVisualCapture(page);
      await page.screenshot({
        fullPage: false,
        path: testInfo.outputPath(`${viewportName}-purchase-result.png`),
      });
      const impactFigure = page.locator(".purchase-impact-figure");
      await expect(impactFigure).toBeVisible();
      await impactFigure.evaluate((element) => {
        element.scrollIntoView({ behavior: "instant", block: "center" });
      });
      await expect
        .poll(() =>
          impactFigure.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            const mobileNavigation = document.querySelector(".mobile-tab-bar");
            const visibleBottom = mobileNavigation &&
              getComputedStyle(mobileNavigation).display !== "none"
              ? mobileNavigation.getBoundingClientRect().top
              : window.innerHeight;
            return bounds.top >= 0 && bounds.bottom <= visibleBottom;
          }),
        )
        .toBe(true);
      await impactFigure.screenshot({
        path: testInfo.outputPath(`${viewportName}-purchase-impact.png`),
      });
    }
  }
});

test("l’onboarding conserve une hiérarchie claire", async ({
  accounts,
  page,
}, testInfo) => {
  const credentials = accounts.uniqueCredentials();

  await page.goto("/auth");
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
      { timeout: 20_000 },
    )
    .toBe(true);

  if (!capturedEmail) {
    throw new Error("Le lien de confirmation Mailpit est introuvable.");
  }

  try {
    await page.goto(capturedEmail.url);
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(
      page.getByRole("heading", {
        name: "Configure ton profil financier.",
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await prepareVisualCapture(page);
    await page.screenshot({
      fullPage: false,
      path: testInfo.outputPath(`${testInfo.project.name}-onboarding.png`),
    });
  } finally {
    await deleteCapturedEmail(
      environment.mailpitUrl,
      capturedEmail.messageId,
    );
  }
});
