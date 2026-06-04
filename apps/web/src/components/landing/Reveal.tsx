"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motionViewport, useMotionReady, usePrefersReducedMotion, useRevealInView } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  y?: number;
}

/** Scroll-triggered slide-up reveal (CSS keyframes; opacity stays 1). */
export function Reveal({ children, delay = 0, y = 14, className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useMotionReady();
  const reduce = usePrefersReducedMotion();
  const enabled = ready && !reduce;
  const inView = useRevealInView(ref, motionViewport, enabled);
  const animate = enabled && inView;
  const motionClass = y > 14 ? "ac-animate-slide-up-lg" : "ac-animate-slide-up";

  return (
    <div
      ref={ref}
      className={cn(className, animate && motionClass)}
      style={animate ? ({ ...style, animationDelay: `${delay}s` } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </div>
  );
}
