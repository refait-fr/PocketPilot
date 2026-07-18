export type RecurringEntryKind = "expense" | "income";

export const recurringEntryCopy = {
  expense: {
    createButton: "Ajouter cette dépense",
    deleteDashboardNote: "Le dashboard sera recalculé dès la suppression.",
    editTitle: "Modifier la dépense",
    emptyDescription:
      "Commencez avec votre principale charge mensuelle. Elle apparaîtra ici dès son enregistrement.",
    emptyTitle: "Aucune dépense enregistrée",
    formDescription:
      "Le montant sera enregistré en centimes et déduit du prochain calcul mensuel.",
    formEyebrow: "Nouvelle dépense",
    formTitle: "Ajoutez une charge stable.",
    labelPlaceholder: "Loyer, assurance, abonnement…",
    listTitle: "Vos dépenses fixes",
    noun: "dépense",
  },
  income: {
    createButton: "Ajouter ce revenu",
    deleteDashboardNote: "Le dashboard sera recalculé dès la suppression.",
    editTitle: "Modifier le revenu",
    emptyDescription:
      "Commencez avec votre principale entrée mensuelle. Elle apparaîtra ici dès son enregistrement.",
    emptyTitle: "Aucun revenu enregistré",
    formDescription:
      "Le montant sera enregistré en centimes et intégré au prochain calcul mensuel.",
    formEyebrow: "Nouveau revenu",
    formTitle: "Ajoutez une entrée stable.",
    labelPlaceholder: "Salaire, bourse, alternance…",
    listTitle: "Vos revenus mensuels",
    noun: "revenu",
  },
} as const;
