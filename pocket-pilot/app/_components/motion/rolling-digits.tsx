"use client";

import { motion, useReducedMotion } from "motion/react";

const DIGITS = "0123456789";

function DigitColumn({ digit }: { digit: string }) {
  const target = Number.parseInt(digit, 10);

  return (
    <span aria-hidden="true" className="rolling-digit">
      <motion.span
        animate={{ y: `${-target}em` }}
        className="rolling-digit-strip"
        initial={{ y: "0em" }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      >
        {DIGITS.split("").map((candidate) => (
          <span key={candidate}>{candidate}</span>
        ))}
      </motion.span>
    </span>
  );
}

export function RollingDigits({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  const reduceMotion = useReducedMotion();

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Le compteur animé attend un entier sûr positif ou nul.");
  }

  if (reduceMotion) {
    return <span className={className}>{value}</span>;
  }

  const characters = String(value).split("");

  return (
    <span className={className ? `rolling-digits ${className}` : "rolling-digits"}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="rolling-digits-visual">
        {characters.map((character, index) => (
          <DigitColumn digit={character} key={`${characters.length - index}-${character}`} />
        ))}
      </span>
    </span>
  );
}
