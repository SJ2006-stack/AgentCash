"use client";

import { motion } from "framer-motion";

import { AgentCashDock } from "@/components/landing/AgentCashDock";
import { easeOut, motionDurations, usePrefersReducedMotion } from "@/lib/motion";

export function DockReveal() {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <AgentCashDock />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: motionDurations.slow, ease: easeOut }}
    >
      <AgentCashDock />
    </motion.div>
  );
}
