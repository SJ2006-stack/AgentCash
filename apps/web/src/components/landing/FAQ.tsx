"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { easeOut, motionDurations } from "@/lib/motion";
import { faqSection, faqs } from "@/content/landing";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container size="md">
        <Reveal>
          <SectionHeading
            eyebrow={faqSection.eyebrow}
            title={faqSection.title}
            description={faqSection.description}
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
