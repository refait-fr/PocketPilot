"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { formatCents } from "@/lib/finance/format-cents";
import { interpolateCents } from "@/lib/motion/interpolation";

const DURATION_MS = 850;

function easeOutExpo(progress: number): number {
  return progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress);
}

export function AnimatedAmount({
  className,
  currencyCode,
  valueCents,
}: {
  className?: string;
  currencyCode: string;
  valueCents: number;
}) {
  const reduceMotion = useReducedMotion();
  const [displayCents, setDisplayCents] = useState(valueCents);
  const displayedRef = useRef(valueCents);
  const mountedRef = useRef(false);

  useEffect(() => {
    const from = mountedRef.current ? displayedRef.current : 0;
    mountedRef.current = true;

    if (reduceMotion || from === valueCents) {
      displayedRef.current = valueCents;
      setDisplayCents(valueCents);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    function tick(now: number) {
      const elapsed = Math.min(1, (now - startedAt) / DURATION_MS);
      const current = interpolateCents(from, valueCents, easeOutExpo(elapsed));
      displayedRef.current = current;
      setDisplayCents(current);
      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion, valueCents]);

  return (
    <span className={className}>
      {formatCents(displayCents, currencyCode)}
    </span>
  );
}
