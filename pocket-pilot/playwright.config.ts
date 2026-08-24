import { defineConfig, devices } from "@playwright/test";

import { readE2EEnvironment } from "./e2e/support/environment";

const environment = readE2EEnvironment();

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: "test-results",
  reporter: process.env.CI
    ? [["dot"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 1 : 0,
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  use: {
    baseURL: environment.baseUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    env: {
      ...process.env,
      E2E_SUPABASE_SERVICE_ROLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        environment.supabasePublishableKey,
      NEXT_PUBLIC_SUPABASE_URL: environment.supabaseUrl,
      SITE_URL: environment.baseUrl,
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: environment.baseUrl,
  },
  workers: 1,
  projects: [
    {
      name: "chromium",
      testIgnore: /mobile\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { height: 900, width: 1440 },
      },
    },
    {
      name: "mobile-chromium",
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
        viewport: { height: 844, width: 390 },
      },
    },
  ],
});
