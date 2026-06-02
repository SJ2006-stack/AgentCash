import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "hero" | "section" | "full";
}

const masks = {
  hero: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 75%)",
  section: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)",
  full: "none",
} as const;

export function GridBackground({ className, variant = "hero", ...props }: GridBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-60",
        "bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]",
        "bg-size-[56px_56px]",
        className,
      )}
      style={{
        maskImage: masks[variant],
        WebkitMaskImage: masks[variant],
      }}
      {...props}
    />
  );
}
