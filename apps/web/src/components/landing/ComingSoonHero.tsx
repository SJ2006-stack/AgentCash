"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { ColorTyperEffect } from "@/components/magicui/color-typer-effect";
import { Button } from "@/components/ui/Button";
import { easeOut, motionDurations, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ROTATING_PHRASES = [
  "x402 payments",
  "agent wallets",
  "pay per API call",
  "task routing",
] as const;

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
      <motion.p
        custom={0}
        variants={stagger}
        className="ac-eyebrow mb-6 inline-flex items-center gap-2 text-emerald-400/90"
      >
        <span
          className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          style={reduceMotion ? undefined : { animation: "ac-pulse-soft 2.4s ease-in-out infinite" }}
          aria-hidden
        />
        AgentCash · early access
      </motion.p>

      <motion.div custom={1} variants={stagger}>
        <ColorTyperEffect
          text="COMING SOON"
          mode="appear"
          showCursor={false}
          className="text-5xl font-bold tracking-[-0.02em] sm:text-6xl sm:tracking-tight md:text-7xl lg:text-8xl"
        />
      </motion.div>

      <motion.div custom={2} variants={stagger}>
        <ColorTyperEffect
          words={[...ROTATING_PHRASES]}
          mode="rotate"
          as="p"
          className="mt-4 min-h-[1.5em] text-xl font-semibold tracking-tight text-emerald-300/95 sm:text-2xl"
        />
      </motion.div>

      <motion.p
        custom={3}
        variants={stagger}
        className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl"
      >
        Micro-payments for AI agents. x402 USDC on Base — budgets, routing, and approvals before a cent leaves your
        wallet.
      </motion.p>

      <motion.ul
        custom={4}
        variants={stagger}
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
        aria-label="Product highlights"
      >
        {["x402", "USDC on Base", "Open source CLI", "BYOK wallet"].map((pill) => (
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
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
      >
        <Button
          size="lg"
          className="min-w-[12rem] bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[var(--ac-shadow-glow)] hover:brightness-105"
          render={<a href="mailto:hello@agentcash.tech?subject=AgentCash%20early%20access" />}
          nativeButton={false}
        >
          Join waitlist
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="min-w-[12rem] border-emerald-400/25 bg-white/[0.02] text-foreground hover:border-emerald-400/40 hover:bg-emerald-400/5"
          render={
            <Link href="https://docs.agentcash.tech" target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
        >
          Read the docs
        </Button>
      </motion.div>
    </motion.div>
  );
}
