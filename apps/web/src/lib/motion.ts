/** Shared Framer Motion presets — keep in sync with design-tokens.css */

import { useEffect, useState } from "react";

/** True only when the OS/browser requests reduced motion (not during SSR). */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const motionDurations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  reveal: 0.6,
} as const;

export const revealTransition = {
  duration: motionDurations.slow,
  ease: easeOut,
} as const;

export const staggerChildren = 0.06;
