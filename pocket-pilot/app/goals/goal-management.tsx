"use client";

import { createGoal } from "@/app/goals/actions";
import { GoalForm } from "@/app/goals/goal-form";
import { GoalRow } from "@/app/goals/goal-row";
import type { GoalView } from "@/app/goals/goal-types";

export function GoalManagement({
  currencyCode,
  goals,
}: {
  currencyCode: string;
  goals: GoalView[];
}) {
  const reachedCount = goals.filter((goal) => goal.isReached).length;
  const inProgressCount = goals.length - reachedCount;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)] xl:items-start">
      <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_16px_50px_rgba(23,53,47,0.08)] sm:p-8 xl:sticky xl:top-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
          Nouveau cap
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.04em]">
          Donnez une trajectoire au projet.
        </h2>
        <p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          La cible, l’épargne actuelle et l’allocation restent séparées pour un
          calcul lisible et déterministe.
        </p>
        <GoalForm action={createGoal} mode="create" />
      </section>

      <section aria-labelledby="goal-list-title" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {inProgressCount} en route · {reachedCount} atteint
              {reachedCount > 1 ? "s" : ""}
            </p>
            <h2
              className="font-display mt-1 text-3xl font-bold tracking-[-0.04em]"
              id="goal-list-title"
            >
              Vos objectifs
            </h2>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">
            {goals.length} au total
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[color:rgba(255,253,247,0.72)] p-8 text-center sm:p-12">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--sage)] font-display text-2xl font-bold">
              ↗
            </span>
            <h3 className="font-display mt-5 text-2xl font-bold tracking-[-0.035em]">
              Aucun objectif défini
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              Commencez par un projet concret. Sa progression et son estimation
              apparaîtront ici après l’enregistrement.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {goals.map((goal) => (
              <GoalRow
                currencyCode={currencyCode}
                goal={goal}
                key={goal.id}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
