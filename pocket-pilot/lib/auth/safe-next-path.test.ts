import assert from "node:assert/strict";
import test from "node:test";

import { safeNextPath } from "./safe-next-path.ts";

test("conserve les chemins internes PocketPilot", () => {
  for (const path of [
    "/",
    "/goals",
    "/settings",
    "/dashboard?foo=bar",
  ]) {
    assert.equal(safeNextPath(path), path);
  }
});

test("rejette les redirections externes et les valeurs invalides", () => {
  const encodedBackslash = new URL(
    "https://pocketpilot.example/auth/confirm?next=/%5Cevil.example",
  ).searchParams.get("next");

  for (const value of [
    null,
    "",
    "goals",
    " //evil.example",
    "//evil.example",
    "///evil.example",
    "/\\evil.example",
    encodedBackslash,
    "https://evil.example",
    "javascript:alert(1)",
    "data:text/html,evil",
  ]) {
    assert.equal(safeNextPath(value), "/onboarding");
  }
});
