"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useMotionReady, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HeroRevealProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
};

/** Hero stagger — slide-up only (opacity stays 1). */
export function HeroReveal({ children, delay = 0, className, style, ...rest }: HeroRevealProps) {
  const ready = useMotionReady();
  const reduce = usePrefersReducedMotion();
  const animate = ready && !reduce;

  return (
    <div
      className={cn(className, animate && "ac-animate-slide-up")}
      style={
        animate ? ({ ...style, animationDelay: `${delay}s` } as CSSProperties) : style
      }
      {...rest}
    >
      {children}
    </div>
  );
}
