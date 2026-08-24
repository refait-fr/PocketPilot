import type { ReactNode } from "react";
import Link from "next/link";

type AuthSupportShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function AuthSupportShell({
  children,
  description,
  eyebrow,
  title,
}: AuthSupportShellProps) {
  return (
    <main className="paper-grid grid min-h-screen place-items-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-lg rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_20px_70px_rgba(23,53,47,0.1)] sm:p-10">
        <Link
          className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]"
          href="/auth"
        >
          <span className="grid size-9 place-items-center rounded-full bg-[var(--forest)] font-display text-lg font-bold text-white">
            P
          </span>
          <span className="font-display text-2xl font-bold tracking-[-0.04em]">
            PocketPilot
          </span>
        </Link>
        <p className="mt-9 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          {eyebrow}
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight tracking-[-0.045em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-soft)]">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
