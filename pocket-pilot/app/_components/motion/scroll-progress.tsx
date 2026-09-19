"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    damping: 28,
    mass: 0.4,
    stiffness: 140,
  });

  return <motion.div aria-hidden="true" className="scroll-progress-bar" style={{ scaleX }} />;
}
