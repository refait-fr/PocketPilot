"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

export function CreationDisclosure({
  buttonLabel,
  children,
  defaultOpen,
  description,
  eyebrow,
  title,
}: {
  buttonLabel: string;
  children: ReactNode;
  defaultOpen: boolean;
  description: string;
  eyebrow: string;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="creation-disclosure" data-open={isOpen}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="creation-summary"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="creation-summary-copy">
          <strong>{buttonLabel}</strong>
          <small>{defaultOpen ? "Première configuration" : "Ouvrir le formulaire"}</small>
        </span>
        <span aria-hidden="true" className="creation-summary-icon">＋</span>
      </button>
      <div className="management-form-panel" hidden={!isOpen} id={panelId}>
        <p className="ui-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="creation-description">{description}</p>
        {children}
      </div>
    </section>
  );
}
