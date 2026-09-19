"use client";

import { AnimatePresence, motion } from "motion/react";
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
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="motion-expand"
            exit={{ height: 0, opacity: 0 }}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            key="panel"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="management-form-panel">
              <p className="ui-kicker">{eyebrow}</p>
              <h2>{title}</h2>
              <p className="creation-description">{description}</p>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
