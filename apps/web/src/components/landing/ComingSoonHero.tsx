"use client";

import { HeroReveal } from "@/components/landing/HeroReveal";
import { BookOpen } from "lucide-react";
import Link from "next/link";

import { ColorTyperEffect } from "@/components/magicui/color-typer-effect";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useMotionEnabled, useMotionReady, usePrefersReducedMotion } from "@/lib/motion";
import { hero, URLS } from "@/content/landing";
import { cn } from "@/lib/utils";

const headlineClass =
  "text-5xl font-bold tracking-[-0.02em] sm:text-6xl sm:tracking-tight md:text-7xl lg:text-8xl";

const rotateClass =
  "mt-5 min-h-[1.5em] text-xl font-semibold tracking-tight text-emerald-300/95 sm:text-2xl";

function HeroHeadline({ motionOn }: { motionOn: boolean }) {
  if (motionOn) {
    return (
      <ColorTyperEffect
        text={hero.headline}
        mode="appear"
        showCursor={false}
        className={headlineClass}
      />
    );
  }
  return (
    <h1
      className={cn(
        headlineClass,
        "bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent",
      )}
    >
      {hero.headline}
    </h1>
  );
}

function HeroRotatingLine({ motionOn }: { motionOn: boolean }) {
  if (motionOn) {
    return (
      <ColorTyperEffect
        words={[...hero.rotatingPhrases]}
        mode="rotate"
        as="p"
        className={rotateClass}
      />
    );
  }
  return <p className={rotateClass}>{hero.rotatingPhrases[0]}</p>;
}

function HeroCtas() {
  return (
    <>
      <Button
        size="lg"
        className="min-w-[12.5rem] bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[var(--ac-shadow-glow)] hover:brightness-105"
        render={<a href={URLS.waitlist} aria-label="Join the AgentCash waitlist by email" />}
        nativeButton={false}
      >
        {hero.primaryCta}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="min-w-[12.5rem] gap-2 border-emerald-400/25 bg-white/[0.02] text-foreground hover:border-emerald-400/40 hover:bg-emerald-400/5"
        render={
          <Link
            href={URLS.docs}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read AgentCash documentation (opens in a new tab)"
          />
        }
        nativeButton={false}
      >
        <BookOpen className="size-4 text-emerald-400/80" aria-hidden />
        {hero.secondaryCta}
      </Button>
    </>
  );
}

export function ComingSoonHero({ className }: { className?: string }) {
  const ready = useMotionReady();
  const reduce = usePrefersReducedMotion();
  const motionOn = useMotionEnabled();

  const shellClass = cn("flex w-full flex-col items-center text-center", className);

  if (!ready || reduce || !motionOn) {
    return (
      <div className={shellClass}>
        <div className="mb-5">
          <Eyebrow
            dot
            className="rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3 py-1 text-emerald-300/95"
          >
            {hero.eyebrow}
          </Eyebrow>
        </div>
        <HeroHeadline motionOn={false} />
        <HeroRotatingLine motionOn={false} />
        <p className="ac-body-lg mt-6 max-w-xl text-muted-foreground">{hero.subhead}</p>
        <ul
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
          aria-label="Product highlights"
        >
          {hero.trustPills.map((pill) => (
            <li
              key={pill}
              className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300/90"
            >
              {pill}
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <HeroCtas />
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <HeroReveal delay={0.04} className="mb-5">
        <Eyebrow
          dot
          className="rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3 py-1 text-emerald-300/95"
        >
          {hero.eyebrow}
        </Eyebrow>
      </HeroReveal>

      <HeroReveal delay={0.12}>
        <HeroHeadline motionOn={motionOn} />
      </HeroReveal>

      <HeroReveal delay={0.2}>
        <HeroRotatingLine motionOn={motionOn} />
      </HeroReveal>

      <HeroReveal delay={0.28} className="ac-body-lg mt-6 max-w-xl text-muted-foreground">
        {hero.subhead}
      </HeroReveal>

      <HeroReveal
        delay={0.36}
        className="mt-7 flex flex-wrap items-center justify-center gap-2"
        aria-label="Product highlights"
      >
        {hero.trustPills.map((pill, i) => (
          <li
            key={pill}
            className={cn(
              "ac-animate-pop-in rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300/90",
              "shadow-[0_0_0_0_rgba(52,211,153,0)] transition hover:scale-[1.04] hover:border-emerald-400/35 hover:bg-emerald-400/10 hover:shadow-[0_0_20px_-6px_rgba(52,211,153,0.45)]",
            )}
            style={{ animationDelay: `${0.44 + i * 0.07}s` }}
          >
            {pill}
          </li>
        ))}
      </HeroReveal>

      <HeroReveal
        delay={0.52}
        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
      >
        <HeroCtas />
      </HeroReveal>
    </div>
  );
}
