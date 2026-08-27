import { expect, test } from "./fixtures";
import { expectNoHorizontalOverflow, login } from "./support/ui";

test.setTimeout(120_000);

test("la landing publique raconte le produit sans bloquer le scroll", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Know what you really have left." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Create my account/ }),
  ).toHaveAttribute("href", "/auth");
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toHaveAttribute(
    "href",
    "/auth",
  );
  await expect(
    page.getByRole("link", { name: /Read the privacy policy/ }),
  ).toHaveAttribute("href", "/privacy");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-landing-hero.png`),
  });

  const purchaseSection = page.locator("[data-purchase-section]");
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const purchaseOffset = await purchaseSection.evaluate(
    (element) => (element as HTMLElement).offsetTop,
  );
  await page.evaluate(
    ([position, width]) => window.scrollTo(0, position + (width >= 1024 ? 950 : 180)),
    [purchaseOffset, viewportWidth],
  );
  await expect(page.getByText("Left after purchase", { exact: true })).toBeVisible();
  await expect(page.getByText("Comfortable", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if (viewportWidth >= 1024) {
    await expect
      .poll(() =>
        page
          .locator(".landing-purchase-pin")
          .evaluate((element) => getComputedStyle(element).position),
      )
      .toBe("fixed");
  } else {
    await expect(page.locator(".landing-purchase-pin")).toHaveCSS(
      "position",
      "static",
    );
  }

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-landing-purchase.png`),
  });

  await page.locator(".landing-footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".landing-footer")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expect
    .poll(() => page.evaluate(() => window.scrollY + window.innerHeight))
    .toBeGreaterThan(
      await page.evaluate(() => document.documentElement.scrollHeight - 40),
    );
});

test("la landing reste complète lorsque les animations sont réduites", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("[data-purchase-section]").scrollIntoViewIfNeeded();

  await expect(page.getByText("Current real margin", { exact: true })).toBeVisible();
  await expect(page.getByText("Left after purchase", { exact: true })).toBeVisible();
  await expect(page.getByText("Comfortable", { exact: true })).toBeVisible();
  await expect(page.locator(".landing-purchase-pin")).toHaveCSS(
    "position",
    "static",
  );
  await expectNoHorizontalOverflow(page);
});

test("le dashboard dédié reste protégé et devient la destination Auth", async ({
  accounts,
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth$/);

  const account = await accounts.create();
  await login(page, account);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Bonjour !" })).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Know what you really have left." }),
  ).toBeVisible();

  await page.goto("/auth");
  await expect(page).toHaveURL(/\/dashboard$/);
});
