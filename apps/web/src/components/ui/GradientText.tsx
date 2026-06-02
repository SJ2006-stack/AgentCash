import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientVariant = "accent" | "cool" | "warm";

const variants: Record<GradientVariant, string> = {
  accent: "from-emerald-300 via-teal-300 to-cyan-300",
  cool: "from-cyan-300 via-sky-300 to-blue-400",
  warm: "from-amber-200 via-orange-300 to-rose-300",
};

interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: GradientVariant;
  as?: "span" | "strong";
}

export function GradientText({
  children,
  className,
  variant = "accent",
  as: Tag = "span",
  ...props
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
