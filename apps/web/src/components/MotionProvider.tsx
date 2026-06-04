"use client";

import { MotionConfig } from "framer-motion";

/** Root Framer Motion config — honors OS prefers-reduced-motion via `user`. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
