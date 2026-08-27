import { AppIcon } from "@/app/_components/app-icon";

const transactions = [
  { category: "Shopping", label: "Chaussures", value: "−72,00 €" },
  { category: "Alimentation", label: "Marché", value: "−38,40 €" },
  { category: "Transport", label: "Essence", value: "−45,00 €" },
] as const;

export function LandingDashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="Démonstration de l’interface du dashboard PocketPilot"
      className={`landing-dashboard-preview${compact ? " is-compact" : ""}`}
      data-dashboard-preview
    >
      <div className="landing-demo-bar">
        <div className="landing-demo-dots" aria-hidden="true"><span /><span /><span /></div>
        <span>Démonstration · Août</span>
        <span className="landing-demo-currency">EUR</span>
      </div>
      <div className="landing-demo-body">
        <div className="landing-demo-heading">
          <div><span>Vue d’ensemble</span><strong>Bonjour !</strong></div>
          <span className="landing-demo-avatar">P</span>
        </div>

        <div className="landing-demo-kpis">
          <article data-demo-card>
            <AppIcon name="wallet" />
            <span>Reste réel</span>
            <strong>628,00 €</strong>
            <small>Disponible ce mois-ci</small>
          </article>
          <article data-demo-card>
            <AppIcon name="transaction" />
            <span>Dépensé</span>
            <strong>200,00 €</strong>
            <small>Sur 1 450,00 €</small>
          </article>
          <article data-demo-card>
            <AppIcon name="goal" />
            <span>Épargne prévue</span>
            <strong>130,00 €</strong>
            <small>Allocation effective</small>
          </article>
        </div>

        <div className="landing-demo-grid">
          <section className="landing-demo-chart" data-demo-card>
            <div><strong>Reste réel au fil du mois</strong><span>Mensuel</span></div>
            <svg aria-label="Courbe de démonstration du reste réel" role="img" viewBox="0 0 600 190">
              <path className="landing-chart-grid" d="M10 35H590M10 85H590M10 135H590M10 180H590" />
              <path className="landing-chart-area" d="M10 55 C85 53 130 56 190 55 S285 51 325 94 S375 112 410 90 S485 82 590 84 V180 H10Z" />
              <path className="landing-chart-line" data-demo-line d="M10 55 C85 53 130 56 190 55 S285 51 325 94 S375 112 410 90 S485 82 590 84" pathLength="1" />
              <circle cx="410" cy="90" r="5" />
            </svg>
            <div className="landing-chart-axis"><span>1</span><span>10</span><span>20</span><span>31</span></div>
          </section>

          <section className="landing-demo-goal" data-demo-card>
            <div className="landing-demo-section-title"><strong>Objectif principal</strong><span>Voir tout</span></div>
            <div className="landing-demo-goal-core">
              <div className="landing-goal-ring"><span><strong>52 %</strong><small>atteint</small></span></div>
              <div><strong>MacBook</strong><small>780 € sur 1 500 €</small></div>
            </div>
            <dl>
              <div><dt>Allocation</dt><dd>120 € / mois</dd></div>
              <div><dt>Restant</dt><dd>720 €</dd></div>
            </dl>
          </section>

          <section className="landing-demo-transactions" data-demo-card>
            <div className="landing-demo-section-title"><strong>Transactions récentes</strong><span>Voir toutes</span></div>
            <ul>
              {transactions.map((transaction) => (
                <li key={transaction.label}>
                  <span className="landing-transaction-mark" aria-hidden="true" />
                  <span><strong>{transaction.label}</strong><small>{transaction.category}</small></span>
                  <strong>{transaction.value}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="landing-demo-budget" data-demo-card>
            <div className="landing-demo-section-title"><strong>Budgets</strong><span>Ce mois</span></div>
            <div><span><strong>Shopping</strong><small>72 € sur 100 €</small></span><strong>72 %</strong></div>
            <div className="landing-demo-progress"><span /></div>
            <div><span><strong>Transport</strong><small>35 € sur 80 €</small></span><strong>44 %</strong></div>
            <div className="landing-demo-progress is-secondary"><span /></div>
          </section>
        </div>
      </div>
    </div>
  );
}
