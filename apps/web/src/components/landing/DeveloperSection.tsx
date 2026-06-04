"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Copy, ExternalLink, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  cliTabContent,
  cliTabs,
  developersSection,
  URLS,
  type CliTabId,
} from "@/content/landing";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const tabs = cliTabs;
const tabContent = cliTabContent;

export function DeveloperSection() {
  const [active, setActive] = useState<CliTabId>("wallet");
  const [visible, setVisible] = useState(0);
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const content = tabContent[active];

  useEffect(() => {
    setVisible(0);
  }, [active]);

  useEffect(() => {
    if (visible >= content.lines.length) return;
    const id = window.setTimeout(() => setVisible((n) => n + 1), 460);
    return () => window.clearTimeout(id);
  }, [visible, content.lines.length, active]);

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [content.command]);

  return (
    <Section id="developers" className="scroll-mt-24">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow={developersSection.eyebrow}
                title={developersSection.title}
                description={developersSection.description}
              />
            </Reveal>

            <Reveal delay={0.08} className="mt-8">
              <div className="relative rounded-lg border border-white/10 bg-black/40 px-4 py-3 pr-12 font-mono text-[length:var(--ac-text-mono)] text-emerald-300/90">
                <code>{content.command}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  onClick={copyCommand}
                  aria-label={copied ? "Copied" : "Copy command"}
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[var(--ac-shadow-glow)]"
                render={<a href="#get-started" />}
                nativeButton={false}
              >
                {developersSection.primaryCta}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-white/12 bg-white/[0.02] text-foreground"
                render={
                  <a href={URLS.docs} target="_blank" rel="noopener noreferrer" />
                }
                nativeButton={false}
              >
                {developersSection.secondaryCta}
                <ExternalLink className="size-3.5" aria-hidden />
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div className="relative">
              <Eyebrow
                dot
                className="mb-4 gap-2 font-mono normal-case tracking-normal text-muted-foreground"
              >
                <Terminal className="size-3.5 text-emerald-400/90" aria-hidden />
                {developersSection.terminalLabel}
              </Eyebrow>

              <div className="ac-terminal overflow-hidden rounded-xl border border-white/10 shadow-[var(--ac-shadow-terminal)]">
                <div className="flex items-center gap-2 border-b border-white/8 bg-black/40 px-4 py-3">
                  <span className="size-2.5 rounded-full bg-rose-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    agentcash — zsh
                  </span>
                </div>

                <div
                  className="flex gap-1 border-b border-white/6 bg-black/30 px-3 py-2"
                  role="tablist"
                  aria-label="CLI command examples"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active === tab.id}
                      onClick={() => setActive(tab.id)}
                      className={cn(
                        "rounded-md px-3 py-1.5 font-mono text-xs transition",
                        active === tab.id
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 px-4 py-5 font-mono text-[length:var(--ac-text-mono)] leading-[var(--ac-text-mono-lh)] sm:px-6">
                  {content.lines.slice(0, visible).map((line, i) => (
                    <motion.p
                      key={`${active}-${i}`}
                      initial={reduce ? false : { opacity: 0, x: -6 }}
                      animate={reduce ? undefined : { opacity: 1, x: 0 }}
                      transition={{ duration: 0.22 }}
                      className={cn(
                        line.kind === "cmd" && "text-emerald-300",
                        line.kind === "out" && "text-muted-foreground",
                        line.kind === "ok" && "text-teal-300",
                      )}
                    >
                      {line.text}
                    </motion.p>
                  ))}
                  {visible < content.lines.length ? (
                    <span
                      className="inline-block h-4 w-2 animate-pulse bg-emerald-400/80"
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
