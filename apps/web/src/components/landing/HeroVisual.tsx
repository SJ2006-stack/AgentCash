"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const terminalLines = [
  { kind: "cmd" as const, text: "$ agentcash pay --budget 0.10 \\" },
  { kind: "cmd" as const, text: '  --url https://api.example/weather' },
  { kind: "out" as const, text: "→ x402: 402 → signed USDC intent" },
  { kind: "ok" as const, text: "✓ 200 OK · spent $0.02 · receipt saved" },
];

const flowSteps = [
  { label: "Agent", sub: "task + cap" },
  { label: "x402", sub: "USDC settle" },
  { label: "API", sub: "metered access" },
];

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.35 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroVisual({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative mx-auto w-full max-w-xl lg:max-w-none", className)}>
      <div
        className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/15 via-transparent to-violet-500/10 blur-2xl"
        aria-hidden
      />

      <motion.div
        className="relative grid gap-4 sm:gap-5"
        variants={reduce ? undefined : stagger}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "show"}
      >
        <motion.div
          variants={reduce ? undefined : item}
          className="ac-terminal relative overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.85)]"
        >
          <div className="flex items-center gap-2 border-b border-white/8 bg-black/45 px-4 py-2.5">
            <span className="size-2 rounded-full bg-rose-400/90" aria-hidden />
            <span className="size-2 rounded-full bg-amber-400/90" aria-hidden />
            <span className="size-2 rounded-full bg-emerald-400/90" aria-hidden />
            <span className="ml-1.5 font-mono text-[10px] text-muted-foreground sm:text-[11px]">
              agentcash — zsh
            </span>
          </div>
          <div className="space-y-1.5 px-4 py-4 font-mono text-[11px] leading-relaxed sm:px-5 sm:text-[12px]">
            {terminalLines.map((line, i) => (
              <motion.p
                key={i}
                initial={reduce ? false : { opacity: 0, x: -6 }}
                animate={reduce ? undefined : { opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.12, duration: 0.35 }}
                className={cn(
                  line.kind === "cmd" && "text-emerald-300/95",
                  line.kind === "out" && "text-muted-foreground",
                  line.kind === "ok" && "text-teal-300",
                )}
              >
                {line.text}
              </motion.p>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-stretch">
          <motion.div
            variants={reduce ? undefined : item}
            className="ac-card flex flex-col justify-center gap-3 rounded-xl p-4 sm:p-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Payment flow
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {flowSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
                    <p className="font-mono text-xs font-semibold text-emerald-300">{step.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{step.sub}</p>
                  </div>
                  {i < flowSteps.length - 1 ? (
                    <ArrowRight className="size-3.5 shrink-0 text-emerald-400/60" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={reduce ? undefined : item}
            className="flex flex-col gap-3 sm:w-[9.5rem]"
          >
            <div className="ac-card flex flex-1 flex-col justify-between rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400/90">
                <Shield className="size-3.5" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Budget
                </span>
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground">
                $0.10
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">hard cap · USD</p>
            </div>

            <div className="ac-card rounded-xl p-3.5">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 place-items-center rounded-md bg-emerald-400/15">
                  <Check className="size-3 text-emerald-400" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-[11px] font-medium text-foreground">Receipt</p>
                  <p className="font-mono text-[10px] text-muted-foreground">ac_7f3… · on disk</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -right-2 -top-3 hidden rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] text-emerald-300/90 shadow-lg backdrop-blur sm:block lg:-right-4"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.45 }}
        aria-hidden
      >
        x402 · Base
      </motion.div>
    </div>
  );
}
