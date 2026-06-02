"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { easeOut, motionDurations } from "@/lib/motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is x402 and how does AgentCash use it?",
    a: "x402 is the HTTP 402 payment flow for machine-to-machine spend. AgentCash ships a buyer CLI that discovers merchant requirements, signs USDC on Base, and stores receipts — so agents pay APIs without a human authorizing every call.",
  },
  {
    q: "Where are wallet keys stored?",
    a: "By default, keys live locally at ~/.agentcash/wallet.key on the machine running the CLI. The marketing site and future dashboard never hold signing material. CDP and WalletConnect modes are opt-in for teams that want hosted or browser-linked wallets.",
  },
  {
    q: "How is pricing structured?",
    a: "You pay merchants per their x402 quotes (often cents per call) plus chain gas. AgentCash tooling is open source today; hosted dashboard and registry features may add paid tiers later — we will publish pricing before anything is billed.",
  },
  {
    q: "Is AgentCash open source?",
    a: "Yes. The x402 client, registry, and task-router packages live in the public monorepo. You can self-host, audit the payment path, and list providers in the curated registry via pull request.",
  },
  {
    q: "Which networks and assets are supported?",
    a: "Day 1 focuses on USDC on Base mainnet and testnet. The CLI surfaces network choice, facilitator config, and balance checks so you can dry-run on testnet before sending real funds.",
  },
  {
    q: "Can I require human approval before spend?",
    a: "That is the product direction: micro-budgets per task, merchant allowlists, and escalation when a run exceeds policy. Task Router v0 ships in-repo now; Slack, email, and magic-link approvals are on the roadmap.",
  },
] as const;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container size="md">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions teams ask before wiring spend"
            description="Straight answers on x402, keys, pricing, and what ships today versus next."
            align="center"
            className="mx-auto max-w-2xl"
          />
        </Reveal>

        <ul className="mt-12 space-y-3">
          {faqs.map((item, index) => (
            <Reveal key={item.q} delay={0.04 * index}>
              <FaqItem
                question={item.q}
                answer={item.a}
                open={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <li className="overflow-hidden rounded-xl border border-[color:var(--ac-border)] bg-[color:var(--ac-surface-glass)] backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180 text-emerald-400/90",
          )}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={reduce ? undefined : { height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: motionDurations.normal, ease: easeOut }
            }
            className="overflow-hidden"
          >
            <p className="border-t border-[color:var(--ac-border)] px-6 pt-3 pb-5 text-sm leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
