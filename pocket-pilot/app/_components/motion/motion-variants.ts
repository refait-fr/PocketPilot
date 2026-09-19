import type { Variants } from "motion/react";

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.05, staggerChildren: 0.07 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
    y: 0,
  },
};
