"use client";

import { AgentCashDock } from "@/components/landing/AgentCashDock";
import { useMotionReady, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DockReveal() {
  const ready = useMotionReady();
  const reduce = usePrefersReducedMotion();
  const animate = ready && !reduce;

  return (
    <div className={cn(animate && "ac-animate-slide-up")} style={animate ? { animationDelay: "0.55s" } : undefined}>
      <AgentCashDock />
    </div>
  );
}
