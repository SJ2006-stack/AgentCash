"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const lines = [
  { kind: "cmd" as const, text: "$ agentcash run --budget 0.10 --task \"summarize inbox\"" },
  { kind: "out" as const, text: "→ Task Router: queued · cap $0.10 USD" },
  { kind: "out" as const, text: "→ Policy: merchant=openai.com · requires_approval=false" },
  { kind: "out" as const, text: "→ x402: payment intent prepared (demo)" },
  { kind: "ok" as const, text: "✓ Run complete · spent $0.04 · receipt ac_7f3…" },
];

export function CliDemo() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= lines.length) return;
    const id = window.setTimeout(() => setVisible((n) => n + 1), 520);
    return () => window.clearTimeout(id);
  }, [visible]);

  return (
    <section id="demo" className="scroll-mt-24 pb-16 md:pb-20">
      <Container size="md">
        <Reveal>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Terminal className="size-3.5 text-emerald-400/90" aria-hidden />
            Live preview (placeholder)
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="ac-terminal overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)]">
            <div className="flex items-center gap-2 border-b border-white/8 bg-black/40 px-4 py-3">
              <span className="size-2.5 rounded-full bg-rose-400/90" aria-hidden />
              <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
              <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">agentcash — zsh</span>
            </div>
            <div className="space-y-2 px-4 py-5 font-mono text-[13px] leading-relaxed sm:px-6 sm:text-sm">
              {lines.slice(0, visible).map((line, i) => (
                <p
                  key={i}
                  className={cn(
                    line.kind === "cmd" && "text-emerald-300",
                    line.kind === "out" && "text-muted-foreground",
                    line.kind === "ok" && "text-teal-300",
                  )}
                >
                  {line.text}
                </p>
              ))}
              {visible < lines.length ? (
                <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400/80" aria-hidden />
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Full CLI + x402 settlement ship in a later release. This panel is a styled placeholder.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
