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
    <div className="management-grid">
      <section className="ui-panel management-form-panel">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
          Nouveau cap
        </p>
        <h2 className="font-display mt-2 text-3xl font-medium tracking-[-0.04em]">
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
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {inProgressCount} en route · {reachedCount} atteint
              {reachedCount > 1 ? "s" : ""}
            </p>
            <h2
              className="font-display mt-1 text-3xl font-medium tracking-[-0.04em]"
              id="goal-list-title"
            >
              Vos objectifs
            </h2>
          </div>
          <span className="ui-badge bg-[var(--surface-muted)] text-[var(--ink-soft)]">
            {goals.length} au total
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="ui-empty">
            <h3 className="font-display text-2xl font-medium tracking-[-0.035em]">
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
