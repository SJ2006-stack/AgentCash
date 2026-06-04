"use client";

import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { useMotionReady, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function MarqueeReveal() {
  const ready = useMotionReady();
  const reduce = usePrefersReducedMotion();
  const animate = ready && !reduce;

  return (
    <div className={cn(animate && "ac-animate-slide-up")} style={animate ? { animationDelay: "0.38s" } : undefined}>
      <ReviewsMarquee />
    </div>
  );
}
