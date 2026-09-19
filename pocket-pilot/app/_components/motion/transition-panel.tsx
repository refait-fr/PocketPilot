"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export function TransitionPanel({
  children,
  className,
  panelKey,
}: {
  children: ReactNode;
  className?: string;
  panelKey: string;
}) {
  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={className}
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 10 }}
        key={panelKey}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
