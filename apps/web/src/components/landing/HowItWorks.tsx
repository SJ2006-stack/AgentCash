"use client";

import { useRef, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { CreditCard, Play, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { howItWorks } from "@/content/landing";
import { Reveal } from "@/components/landing/Reveal";
import { motionViewport, useMotionReady, usePrefersReducedMotion, useRevealInView } from "@/lib/motion";
import { cn } from "@/lib/utils";

const stepIcons = [CreditCard, Search, Play] as const;

const steps = howItWorks.steps.map((step, index) => ({
  ...step,
  icon: stepIcons[index] ?? Play,
}));

export function HowItWorks() {
  const ready = useMotionReady();
  const reduce = usePrefersReducedMotion();
  const motionOn = ready && !reduce;

  return (
    <Section id="how-it-works" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={howItWorks.eyebrow}
            title={howItWorks.title}
            description={howItWorks.description}
            align="center"
            className="mx-auto max-w-2xl"
          />
        </Reveal>

        <div className="relative mt-16">
          {motionOn ? <HowItWorksLine /> : (
            <div
              aria-hidden
              className="pointer-events-none absolute top-10 right-[12%] left-[12%] hidden h-px origin-left bg-gradient-to-r from-emerald-400/15 via-emerald-400/45 to-emerald-400/15 md:block"
            />
          )}

          <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((item, index) => (
              <StepCard key={item.step} {...item} index={index} motionOn={motionOn} />
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

function HowItWorksLine() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRevealInView(ref, motionViewport);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-10 right-[12%] left-[12%] hidden h-px origin-left bg-gradient-to-r from-emerald-400/15 via-emerald-400/45 to-emerald-400/15 md:block",
        inView && "ac-animate-scale-x-in",
      )}
      style={inView ? ({ animationDelay: "0.15s" } as CSSProperties) : undefined}
    />
  );
}

function StepCard({
  step,
  title,
  description,
  icon: Icon,
  index,
  motionOn,
}: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  motionOn: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useRevealInView(ref, motionViewport, motionOn);
  const showConnector = index < steps.length - 1;
  const animate = motionOn && inView;

  const cardClass =
    "relative flex flex-col items-center text-center md:items-start md:text-left";

  return (
    <li
      ref={ref}
      className={cn(cardClass, animate && "ac-animate-slide-up-lg")}
      style={animate ? ({ animationDelay: `${0.07 * index}s` } as CSSProperties) : undefined}
    >
      {showConnector ? (
        <div
          aria-hidden
          className={cn(
            "absolute top-14 left-1/2 h-[calc(100%+2.5rem)] w-px -translate-x-1/2 origin-top bg-gradient-to-b from-emerald-400/35 to-transparent md:hidden",
            animate && "ac-animate-scale-y-in",
          )}
          style={animate ? ({ animationDelay: `${0.12 + index * 0.05}s` } as CSSProperties) : undefined}
        />
      ) : null}

      <div className="relative z-10 mb-5 flex flex-col items-center gap-4 md:flex-row md:items-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_-10px_rgba(52,211,153,0.4)]">
          <Icon className="size-5" aria-hidden />
        </div>
        <span className="font-mono text-xs font-medium text-emerald-400/70">{step}</span>
      </div>
      <h3 className="ac-h3 text-foreground">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
    </li>
  );
}
