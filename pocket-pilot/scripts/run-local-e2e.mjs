import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { delimiter, join } from "node:path";

const require = createRequire(import.meta.url);
const playwrightCliPath = require.resolve("@playwright/test/cli");
const supabaseCliPath = require.resolve("supabase/dist/supabase.js");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function environmentWithLocalContainerRuntime() {
  const environment = { ...process.env };

  if (process.platform !== "win32") {
    return environment;
  }

  const runtimeDirectories = [
    environment.LOCALAPPDATA
      ? join(
          environment.LOCALAPPDATA,
          "Programs",
          "DockerDesktop",
          "resources",
          "bin",
        )
      : undefined,
    environment.ProgramFiles
      ? join(environment.ProgramFiles, "Docker", "Docker", "resources", "bin")
      : undefined,
    environment.ProgramFiles
      ? join(environment.ProgramFiles, "RedHat", "Podman")
      : undefined,
  ];
  const runtimeDirectory = runtimeDirectories.find(
    (directory) =>
      directory &&
      (existsSync(join(directory, "docker.exe")) ||
        existsSync(join(directory, "podman.exe"))),
  );

  if (runtimeDirectory) {
    const pathKey =
      Object.keys(environment).find((name) => name.toLowerCase() === "path") ??
      "PATH";
    environment[pathKey] = `${runtimeDirectory}${delimiter}${environment[pathKey] ?? ""}`;
  }

  return environment;
}

const localProcessEnvironment = environmentWithLocalContainerRuntime();

const statusResult = spawnSync(
  process.execPath,
  [supabaseCliPath, "status", "--output", "json"],
  {
    encoding: "utf8",
    env: localProcessEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

if (statusResult.error) {
  fail(
    `Impossible d’exécuter Supabase CLI (${statusResult.error.code ?? "erreur inconnue"}).`,
  );
}

if (statusResult.status !== 0) {
  fail(
    "Supabase local n’est pas démarré. Lancez `npm run supabase:start` avant les E2E.",
  );
}

let status;

try {
  status = JSON.parse(statusResult.stdout);
} catch {
  fail("La sortie de `supabase status` n’est pas un JSON exploitable.");
}

const supabaseUrl = status.API_URL;
const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const serviceRoleKey = status.SERVICE_ROLE_KEY;

if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
  fail("Les credentials de l’instance Supabase locale sont incomplets.");
}

let parsedSupabaseUrl;

try {
  parsedSupabaseUrl = new URL(supabaseUrl);
} catch {
  fail("L’URL retournée par Supabase local est invalide.");
}

if (!["127.0.0.1", "localhost"].includes(parsedSupabaseUrl.hostname)) {
  fail("Le lanceur local refuse toute instance Supabase distante.");
}

const testResult = spawnSync(
  process.execPath,
  [playwrightCliPath, "test", ...process.argv.slice(2)],
  {
    env: {
      ...localProcessEnvironment,
      E2E_BASE_URL: "http://127.0.0.1:3000",
      E2E_CONFIRM_NON_PRODUCTION: "true",
      E2E_MAILPIT_URL:
        status.MAILPIT_URL ??
        status.INBUCKET_URL ??
        "http://127.0.0.1:54324",
      E2E_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      E2E_SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
      E2E_SUPABASE_URL: parsedSupabaseUrl.origin,
    },
    stdio: "inherit",
  },
);

process.exit(testResult.status ?? 1);
