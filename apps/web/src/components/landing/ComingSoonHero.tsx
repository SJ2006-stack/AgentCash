"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Link from "next/link";

import { ColorTyperEffect } from "@/components/magicui/color-typer-effect";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { easeOut, motionDurations, usePrefersReducedMotion } from "@/lib/motion";
import { hero, URLS } from "@/content/landing";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: motionDurations.slow,
      ease: easeOut,
    },
  }),
};

export function ComingSoonHero({ className }: { className?: string }) {
  const reduceMotion = usePrefersReducedMotion();

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
      };

  return (
    <motion.div className={cn("flex w-full flex-col items-center text-center", className)} {...motionProps}>
      <motion.div custom={0} variants={stagger} className="mb-5">
        <Eyebrow
          dot
          className="rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3 py-1 text-emerald-300/95"
        >
          {hero.eyebrow}
        </Eyebrow>
      </motion.div>

      <motion.div custom={1} variants={stagger}>
        <ColorTyperEffect
          text={hero.headline}
          mode="appear"
          showCursor={false}
          className="text-5xl font-bold tracking-[-0.02em] sm:text-6xl sm:tracking-tight md:text-7xl lg:text-8xl"
        />
      </motion.div>

      <motion.div custom={2} variants={stagger}>
        <ColorTyperEffect
          words={[...hero.rotatingPhrases]}
          mode="rotate"
          as="p"
          className="mt-5 min-h-[1.5em] text-xl font-semibold tracking-tight text-emerald-300/95 sm:text-2xl"
        />
      </motion.div>

      <motion.p
        custom={3}
        variants={stagger}
        className="ac-body-lg mt-6 max-w-xl text-muted-foreground"
      >
        {hero.subhead}
      </motion.p>

      <motion.ul
        custom={4}
        variants={stagger}
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
      </motion.ul>

      <motion.div
        custom={5}
        variants={stagger}
        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
      >
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
      </motion.div>
    </motion.div>
  );
}
