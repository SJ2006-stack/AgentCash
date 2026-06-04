"use client";

import { motion, useScroll, type MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface ScrollProgressProps extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  ref?: React.Ref<HTMLDivElement>;
}

export function ScrollProgress({ className, ref, ...props }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      ref={ref}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] origin-left bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500 shadow-[0_0_12px_-2px_rgba(52,211,153,0.45)]",
        className,
      )}
      style={{ scaleX: scrollYProgress }}
      aria-hidden
      {...props}
    />
  );
}
