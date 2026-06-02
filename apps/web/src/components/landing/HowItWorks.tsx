"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CreditCard, Play, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";

const steps: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    step: "01",
    title: "Connect wallet",
    description: "Create a local BYOK wallet on Base, fund USDC, and verify with doctor.",
    icon: CreditCard,
  },
  {
    step: "02",
    title: "Discover services",
    description: "Browse the curated x402 registry — search, data, weather, and more by capability.",
    icon: Search,
  },
  {
    step: "03",
    title: "Pay & execute",
    description: "Quote or run a task under budget; each subtask pays via x402 and logs a receipt.",
    icon: Play,
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <Section id="how-it-works" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From wallet to paid API in three steps"
            description="No custodial hop. Deposit USDC to your agent address, pick services from the registry, and let the task router settle each call."
            align="center"
            className="mx-auto max-w-2xl"
          />
        </Reveal>

        <div className="relative mt-16">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-10 right-[12%] left-[12%] hidden h-px origin-left bg-gradient-to-r from-emerald-400/15 via-emerald-400/45 to-emerald-400/15 md:block"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={reduce ? undefined : { scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          />

          <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((item, index) => (
              <StepCard
                key={item.step}
                {...item}
                index={index}
                showConnector={index < steps.length - 1}
                reduce={!!reduce}
              />
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

function StepCard({
  step,
  title,
  description,
  icon: Icon,
  index,
  showConnector,
  reduce,
}: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  showConnector: boolean;
  reduce: boolean;
}) {
  return (
    <motion.li
      className="relative flex flex-col items-center text-center md:items-start md:text-left"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: 0.07 * index, ease: [0.22, 1, 0.36, 1] }}
    >
      {showConnector ? (
        <motion.div
          aria-hidden
          className="absolute top-14 left-1/2 h-[calc(100%+2.5rem)] w-px -translate-x-1/2 bg-gradient-to-b from-emerald-400/35 to-transparent md:hidden"
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={reduce ? undefined : { scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
          style={{ originY: 0 }}
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
    </motion.li>
  );
}
