import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/landing/Reveal";

/** Full-width closing band — repeats hero primary CTA (#developers). */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[color:var(--ac-border)] py-[var(--ac-section-y)]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/[0.08] via-[#060a0f] to-[#040608]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent"
        aria-hidden
      />

      <Container className="relative">
        <Reveal>
          <div className="ac-card mx-auto max-w-3xl border-emerald-400/20 bg-gradient-to-br from-white/[0.05] to-white/[0.01] px-8 py-12 text-center sm:px-12 sm:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">Get started</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ready to give your agents a budget?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Cap a run at cents, settle over x402, and keep receipts on disk — same path as the hero, no wallet required
              to explore the developer flow.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-11 gap-2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 px-6 text-emerald-950 shadow-[0_0_40px_-8px_rgba(52,211,153,0.45)] hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-400"
                render={<a href="#developers" />}
                nativeButton={false}
              >
                Start building
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 border-white/12 bg-white/[0.02] text-foreground hover:border-emerald-400/30"
                render={
                  <a href="https://docs.agentcash.tech" target="_blank" rel="noopener noreferrer" />
                }
                nativeButton={false}
              >
                <BookOpen className="size-4 text-emerald-400/80" aria-hidden />
                Read the docs
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
