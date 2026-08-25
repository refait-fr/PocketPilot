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
    <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 py-12 sm:px-8">
      <section className="ui-panel w-full max-w-xl p-7 sm:p-10">
        <Link
          className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]"
          href="/auth"
        >
          <span className="brand-mark">
            P
          </span>
          <span className="font-display text-2xl font-semibold tracking-[-0.04em]">
            PocketPilot
          </span>
        </Link>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-soft)]">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
