import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/** Vertical rhythm wrapper. Pairs with `Container` for horizontal width. */
export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section className={cn("relative py-20 sm:py-28", className)} {...props}>
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">{eyebrow}</span>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description ? (
        <p className="text-base leading-relaxed text-white/55 sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
