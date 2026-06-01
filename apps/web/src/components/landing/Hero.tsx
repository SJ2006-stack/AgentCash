import { ArrowDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/landing/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-10 md:pt-20 md:pb-14">
      <div className="ac-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 flex justify-center opacity-50 blur-3xl"
        aria-hidden
      >
        <div className="h-72 w-[min(100%,48rem)] rounded-full bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-violet-500/20" />
      </div>

      <Container className="relative">
        <Reveal>
          <Badge
            variant="outline"
            className="gap-2 border-emerald-400/30 bg-emerald-400/10 font-mono text-[11px] uppercase tracking-wider text-emerald-300"
          >
            <span
              className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.55)]"
              aria-hidden
            />
            x402-ready · task router
          </Badge>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight text-foreground md:text-5xl lg:text-[3.35rem]">
            Give an AI{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              $0.10
            </span>
            .<br className="hidden sm:block" /> Watch it spend with guardrails.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            AgentCash is the control plane for agent micro-payments — budgets, merchant rules, and human
            approvals before a cent leaves your wallet. Wire a task, cap the spend, ship the run.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            className="h-11 gap-2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 px-6 text-emerald-950 shadow-[0_0_40px_-8px_rgba(52,211,153,0.45)] hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-400"
            render={<a href="#demo" />}
            nativeButton={false}
          >
            <Sparkles className="size-4" aria-hidden />
            See the CLI demo
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 border-white/12 bg-white/[0.02] text-foreground hover:border-emerald-400/30"
            render={<a href="#roadmap" />}
            nativeButton={false}
          >
            Coming soon: Task Router
          </Button>
        </Reveal>

        <Reveal delay={0.2} className="mt-14 flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowDown className="size-4 text-emerald-400/80" aria-hidden />
          Interactive preview below — no wallet required
        </Reveal>
      </Container>
    </section>
  );
}
