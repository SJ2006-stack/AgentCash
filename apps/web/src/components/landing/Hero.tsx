"use client";

import type { ReactNode } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { GridBackground } from "@/components/ui/GridBackground";
import { HeroVisual } from "@/components/landing/HeroVisual";

const ease = [0.22, 1, 0.36, 1] as const;

function HeroReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:pt-12 md:pb-16 lg:pb-20">
      <GridBackground variant="hero" />
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 flex justify-center opacity-45 blur-3xl"
        aria-hidden
      >
        <div className="h-72 w-[min(100%,48rem)] rounded-full bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-violet-500/20" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <HeroReveal>
              <Eyebrow
                dot
                className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono normal-case tracking-wider text-emerald-300"
              >
                Now in beta
              </Eyebrow>
            </HeroReveal>

            <HeroReveal delay={0.06}>
              <h1 className="ac-display mt-6 max-w-4xl text-foreground">
                Agents that pay
                <br />
                for <GradientText>API access</GradientText>.
              </h1>
            </HeroReveal>

            <HeroReveal delay={0.12}>
              <p className="ac-body-lg mt-5 max-w-lg text-muted-foreground">
                AgentCash is the wallet and control plane for autonomous spend — x402 USDC settlement,
                budget caps, and receipts before a cent leaves your key.
              </p>
            </HeroReveal>

            <HeroReveal delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                className="h-11 w-full gap-2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 px-6 text-emerald-950 shadow-[var(--ac-shadow-glow)] hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-400 sm:w-auto"
                render={<a href="#developers" />}
                nativeButton={false}
              >
                Start building
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 w-full border-white/12 bg-white/[0.02] text-foreground hover:border-emerald-400/30 sm:w-auto"
                render={
                  <a href="https://docs.agentcash.tech" target="_blank" rel="noopener noreferrer" />
                }
                nativeButton={false}
              >
                <BookOpen className="size-4 text-emerald-400/80" aria-hidden />
                Read the docs
              </Button>
            </HeroReveal>

            <HeroReveal delay={0.24} className="mt-6">
              <p className="font-mono text-xs text-muted-foreground">
                <span className="text-emerald-400/90">npm run agentcash</span>
                <span className="text-muted-foreground/80"> — wallet create · doctor · pay</span>
              </p>
            </HeroReveal>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease }}
            className="relative lg:pl-2"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
