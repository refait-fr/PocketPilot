import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchAllWithRange,
  SUPABASE_PAGE_SIZE,
} from "./paginate.ts";

function fakePages<T>(total: number) {
  return (from: number, to: number): Promise<{ data: T[] | null; error: unknown }> => {
    const page: T[] = [];

    for (let index = from; index <= to && index < total; index += 1) {
      page.push(index as T);
    }

    return Promise.resolve({ data: page, error: null });
  };
}

test("retourne toutes les lignes sur plusieurs pages", async () => {
  const rows = await fetchAllWithRange(fakePages<number>(SUPABASE_PAGE_SIZE * 2 + 3));

  assert.equal(rows.length, SUPABASE_PAGE_SIZE * 2 + 3);
  assert.equal(rows[0], 0);
  assert.equal(rows[rows.length - 1], SUPABASE_PAGE_SIZE * 2 + 2);
});

test("s'arrête exactement sur un multiple de la taille de page", async () => {
  const rows = await fetchAllWithRange(fakePages<number>(SUPABASE_PAGE_SIZE));

  assert.equal(rows.length, SUPABASE_PAGE_SIZE);
});

test("retourne un tableau vide sans page", async () => {
  const rows = await fetchAllWithRange(fakePages<number>(0));

  assert.deepEqual(rows, []);
});

test("propage l'erreur brute d'une page", async () => {
  const failure = new Error("panne base");

  await assert.rejects(
    fetchAllWithRange<number>(() => Promise.resolve({ data: null, error: failure })),
    (error: unknown) => error === failure,
  );
});
