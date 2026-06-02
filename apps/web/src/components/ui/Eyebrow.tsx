import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  dot?: boolean;
}

export function Eyebrow({ className, children, dot = false, ...props }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold uppercase text-emerald-300/90",
        "text-[length:var(--ac-text-eyebrow)] tracking-[var(--ac-text-eyebrow-tracking)]",
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          className="size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.55)]"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
