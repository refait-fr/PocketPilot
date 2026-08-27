import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { LandingAnimations } from "@/app/_components/landing/landing-animations";
import { LandingDashboardPreview } from "@/app/_components/landing/landing-dashboard-preview";
import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";

const marginSteps = [
  { label: "Monthly income", operator: "", value: "1 450 €" },
  { label: "Fixed expenses", operator: "−", value: "492 €" },
  { label: "Goal allocations", operator: "−", value: "130 €" },
  { label: "Transactions", operator: "−", value: "200 €" },
] as const;

const transactionRows = [
  { category: "Shopping", label: "Shoes", value: "−72,00 €" },
  { category: "Food", label: "Groceries", value: "−38,40 €" },
  { category: "Transport", label: "Fuel", value: "−45,00 €" },
  { category: "Leisure", label: "Cinema", value: "−19,00 €" },
] as const;

const budgets = [
  { label: "Shopping", percent: 72, value: "72 / 100 €" },
  { label: "Transport", percent: 44, value: "35 / 80 €" },
  { label: "Food", percent: 66, value: "164 / 250 €" },
] as const;

function BrandLink({ light = false }: { light?: boolean }) {
  return (
    <Link aria-label="PocketPilot, home" className="landing-brand" href="/">
      <PocketPilotLogo priority size={32} tone={light ? "light" : "dark"} />
      <span>PocketPilot</span>
    </Link>
  );
}

export function LandingPage() {
  return (
    <main className="landing" data-landing-root>
      <a className="skip-link" href="#landing-content">Skip to content</a>
      <LandingAnimations />

      <header className="landing-header" data-landing-header>
        <BrandLink />
        <nav aria-label="Public navigation">
          <Link className="landing-sign-in" href="/auth">Sign in</Link>
          <Link className="landing-button landing-button-dark" href="/auth">Get started</Link>
        </nav>
      </header>

      <div id="landing-content">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-copy">
            <p className="landing-eyebrow js-hero-reveal">Your month, made legible.</p>
            <h1 id="landing-title">
              <span className="js-hero-reveal">Know what you</span>
              <span className="js-hero-reveal">really have left.</span>
            </h1>
            <p className="landing-hero-lead js-hero-reveal">
              PocketPilot turns your income, expenses, budgets and goals into one clear number.
            </p>
            <div className="landing-hero-actions js-hero-reveal">
              <Link className="landing-button landing-button-dark" href="/auth">Create my account <span aria-hidden="true">↗</span></Link>
              <a className="landing-text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <p className="landing-demo-note js-hero-reveal">Free to start · Manual data entry · No bank connection</p>
          </div>
          <div className="landing-hero-preview js-hero-preview">
            <LandingDashboardPreview />
          </div>
        </section>

        <section className="landing-margin" id="how-it-works" aria-labelledby="margin-title">
          <div className="landing-section-intro" data-reveal>
            <p className="landing-eyebrow">The number that matters</p>
            <h2 id="margin-title">One number.<br />Your real monthly margin.</h2>
            <p>Income is only the beginning. PocketPilot subtracts what is already committed, so your month starts with context.</p>
          </div>
          <div className="landing-margin-equation" aria-label="Example calculation of real monthly margin">
            <p className="landing-example-label">Illustrative example</p>
            <ol>
              {marginSteps.map((step) => (
                <li data-margin-step key={step.label}>
                  <span>{step.label}</span><strong><i>{step.operator}</i>{step.value}</strong>
                </li>
              ))}
            </ol>
            <div className="landing-margin-result" data-margin-result>
              <span>Really left</span><strong>628 €</strong><small>for the rest of the month</small>
            </div>
          </div>
        </section>

        <section className="landing-cockpit" aria-labelledby="cockpit-title">
          <div className="landing-cockpit-heading" data-reveal>
            <p className="landing-eyebrow">Your financial cockpit</p>
            <h2 id="cockpit-title">The whole month,<br />in one frame.</h2>
            <p>Real margin, recent spending, category limits and your next goal stay connected instead of living in separate spreadsheets.</p>
          </div>
          <div className="landing-cockpit-stage" data-cockpit-stage>
            <LandingDashboardPreview compact />
          </div>
        </section>

        <section className="landing-spending" aria-labelledby="spending-title">
          <div className="landing-spending-copy" data-reveal>
            <p className="landing-eyebrow">Transactions</p>
            <h2 id="spending-title">See where your money actually goes.</h2>
            <p>Add the purchases that shape your month. PocketPilot updates your real margin without pretending to sync a bank account.</p>
          </div>
          <div className="landing-transaction-ledger" data-transaction-ledger>
            <div className="landing-ledger-heading"><span>Demonstration</span><strong>Spent this month <i>200,00 €</i></strong></div>
            <ul>
              {transactionRows.map((transaction) => (
                <li data-transaction-row key={transaction.label}>
                  <span className="landing-ledger-icon"><AppIcon name="transaction" /></span>
                  <span><strong>{transaction.label}</strong><small>{transaction.category}</small></span>
                  <strong>{transaction.value}</strong>
                </li>
              ))}
            </ul>
            <div className="landing-ledger-total"><span>Real margin after these entries</span><strong>628,00 €</strong></div>
          </div>
        </section>

        <section className="landing-budgets" aria-labelledby="budgets-title">
          <div className="landing-section-intro" data-reveal>
            <p className="landing-eyebrow">Category budgets</p>
            <h2 id="budgets-title">Set limits.<br />Keep the context.</h2>
            <p>Budgets show your pace. They never block a purchase or make the decision for you.</p>
          </div>
          <div className="landing-budget-stack">
            {budgets.map((budget) => (
              <article data-budget-card key={budget.label}>
                <div><span>{budget.label}</span><strong>{budget.value}</strong></div>
                <div aria-label={`${budget.percent}% of the ${budget.label} example budget used`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={budget.percent} className="landing-budget-track" role="progressbar"><span data-budget-fill style={{ "--budget-width": `${budget.percent}%` } as React.CSSProperties} /></div>
                <small>{budget.percent}% used</small>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-purchase" aria-labelledby="purchase-title" data-purchase-section>
          <div className="landing-purchase-pin">
            <div className="landing-purchase-copy">
              <p className="landing-eyebrow">Purchase Checker</p>
              <h2 id="purchase-title">Before you buy it,<br />check the impact.</h2>
              <p>Test a purchase against your current real margin. The result is deterministic, private to your session and never generated by AI.</p>
            </div>
            <div className="landing-purchase-calculator" data-purchase-calculator>
              <p>Illustrative check</p>
              <div data-purchase-step><span>Current real margin</span><strong>628 €</strong></div>
              <div data-purchase-step><span>Purchase</span><strong>−149 €</strong></div>
              <div className="landing-purchase-rule" aria-hidden="true" />
              <div className="landing-purchase-result" data-purchase-result><span>Left after purchase</span><strong>479 €</strong></div>
              <span className="landing-comfort-badge" data-purchase-badge>Comfortable</span>
            </div>
          </div>
        </section>

        <section className="landing-goals" aria-labelledby="goals-title">
          <div className="landing-goal-copy" data-reveal>
            <p className="landing-eyebrow">Goals</p>
            <h2 id="goals-title">Keep your goals<br />in the same picture.</h2>
            <p>Allocations are part of your monthly plan, not an afterthought. PocketPilot estimates progress without presenting projections as guarantees.</p>
          </div>
          <article className="landing-goal-demo" data-goal-demo>
            <div className="landing-goal-demo-top"><span>Primary goal</span><span>52% complete</span></div>
            <div className="landing-goal-demo-main"><span className="landing-goal-icon"><AppIcon name="goal" /></span><div><h3>MacBook</h3><p><strong>780 €</strong> saved of 1 500 €</p></div></div>
            <div className="landing-goal-progress"><span data-goal-fill /></div>
            <dl>
              <div><dt>Remaining</dt><dd>720 €</dd></div>
              <div><dt>Monthly allocation</dt><dd>120 €</dd></div>
              <div><dt>Estimated duration</dt><dd>6 months</dd></div>
            </dl>
            <small>Projection based on the demonstrated allocation.</small>
          </article>
        </section>

        <section className="landing-privacy" aria-labelledby="privacy-title">
          <div className="landing-privacy-mark" aria-hidden="true"><PocketPilotLogo size={92} tone="light" /></div>
          <div data-reveal>
            <p className="landing-eyebrow">Privacy by account</p>
            <h2 id="privacy-title">Your financial data stays private.</h2>
            <p>Your entries belong to your account, access is isolated between users, and you can permanently delete your account and PocketPilot data.</p>
            <Link href="/privacy">Read the privacy policy <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="landing-final" aria-labelledby="final-title">
          <div className="landing-final-symbol" aria-hidden="true">P</div>
          <div data-reveal>
            <p className="landing-eyebrow">Your next month starts here</p>
            <h2 id="final-title">Take control<br />of what’s left.</h2>
            <Link className="landing-button landing-button-light" href="/auth">Start with PocketPilot <span aria-hidden="true">↗</span></Link>
            <p>Already have an account? <Link href="/auth">Sign in</Link></p>
          </div>
        </section>
      </div>

      <footer className="landing-footer">
        <BrandLink />
        <nav aria-label="Footer navigation"><span>Product</span><Link href="/auth">Sign in</Link><Link href="/privacy">Privacy</Link></nav>
        <p>Jovure · © {new Date().getFullYear()} PocketPilot.</p>
      </footer>
    </main>
  );
}
