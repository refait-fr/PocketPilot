export default function QuickAddTransactionLoading() {
  return (
    <div className="quick-add-frame" aria-busy="true" aria-label="Chargement de l’ajout rapide">
      <div className="quick-add-header">
        <div className="ui-skeleton" style={{ height: "1.9rem", width: "9rem" }} />
        <div className="ui-skeleton" style={{ height: "2.5rem", width: "11rem" }} />
      </div>
      <div className="quick-add-main">
        <div className="ui-skeleton" style={{ height: "0.7rem", width: "6rem" }} />
        <div className="ui-skeleton" style={{ height: "2rem", width: "12rem" }} />
        <div className="ui-skeleton" style={{ height: "3rem", width: "100%" }} />
        <div className="ui-skeleton" style={{ height: "3rem", width: "100%" }} />
        <div className="ui-skeleton" style={{ height: "3rem", width: "100%" }} />
      </div>
    </div>
  );
}
