import type { HTMLAttributes, ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/** Vertical rhythm wrapper. Pairs with `Container` for horizontal width. */
export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section className={cn("relative py-[var(--ac-section-y)]", className)} {...props}>
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
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="ac-h2 text-foreground">{title}</h2>
      {description ? (
        <p className="ac-body-lg text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
