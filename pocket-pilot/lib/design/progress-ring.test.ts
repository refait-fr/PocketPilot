import assert from "node:assert/strict";
import test from "node:test";

import { clampRingProgress, getRingGeometry } from "./progress-ring.ts";

test("borne la progression entre 0 et 100", () => {
  assert.equal(clampRingProgress(-12), 0);
  assert.equal(clampRingProgress(0), 0);
  assert.equal(clampRingProgress(62.5), 62.5);
  assert.equal(clampRingProgress(100), 100);
  assert.equal(clampRingProgress(142), 100);
});

test("rejette les progressions non finies", () => {
  assert.throws(() => clampRingProgress(Number.NaN), /anneau/);
  assert.throws(
    () => clampRingProgress(Number.POSITIVE_INFINITY),
    /anneau/,
  );
});

test("calcule la circonférence et le décalage pour un rayon donné", () => {
  const full = getRingGeometry({ percentage: 100, radius: 10 });
  assert.equal(full.circumference, 2 * Math.PI * 10);
  assert.equal(full.dashOffset, 0);
  assert.equal(full.progress, 100);

  const half = getRingGeometry({ percentage: 50, radius: 10 });
  assert.ok(Math.abs(half.dashOffset - half.circumference / 2) < 1e-9);

  const empty = getRingGeometry({ percentage: 0, radius: 10 });
  assert.equal(empty.dashOffset, empty.circumference);
});

test("borne le pourcentage avant de calculer la géométrie", () => {
  const geometry = getRingGeometry({ percentage: 140, radius: 8 });
  assert.equal(geometry.progress, 100);
  assert.equal(geometry.dashOffset, 0);
});

test("rejette un rayon invalide", () => {
  assert.throws(() => getRingGeometry({ percentage: 50, radius: 0 }), /rayon/);
  assert.throws(
    () => getRingGeometry({ percentage: 50, radius: -4 }),
    /rayon/,
  );
  assert.throws(
    () => getRingGeometry({ percentage: 50, radius: Number.NaN }),
    /rayon/,
  );
});
