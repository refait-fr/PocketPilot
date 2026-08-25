"use client";

import { createGoal } from "@/app/goals/actions";
import { CreationDisclosure } from "@/app/_components/creation-disclosure";
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
    <div className="management-stack">
      <section aria-labelledby="goal-list-title" className="min-w-0">
        <div className="management-list-heading">
          <div>
            <p className="ui-kicker">
              {inProgressCount} en route · {reachedCount} atteint
              {reachedCount > 1 ? "s" : ""}
            </p>
            <h2
              className="management-title"
              id="goal-list-title"
            >
              Vos objectifs
            </h2>
          </div>
          <span className="ui-badge">
            {goals.length} au total
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="ui-empty">
            <h3>
              Aucun objectif défini
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              Commencez par un projet concret. Sa progression et son estimation
              apparaîtront ici après l’enregistrement.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
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
      <CreationDisclosure
        buttonLabel="Ajouter un objectif"
        defaultOpen={goals.length === 0}
        description="La cible, l’épargne actuelle et l’allocation restent séparées."
        eyebrow="Nouvel objectif"
        title="Ajouter un objectif"
      >
        <GoalForm action={createGoal} mode="create" />
      </CreationDisclosure>
    </div>
  );
}
