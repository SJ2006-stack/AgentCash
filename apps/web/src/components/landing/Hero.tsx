import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/landing/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="pointer-events-none absolute inset-x-0 -top-24 flex justify-center opacity-40 blur-3xl" aria-hidden>
        <div className="h-64 w-[min(100%,42rem)] rounded-full bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/25" />
      </div>
      <Container className="relative">
        <Reveal>
          <Badge variant="outline" className="gap-2 border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <span
              className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]"
              aria-hidden
            />
            Spend rails for AI agents
          </Badge>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
            Turn agent spend into something you can trust.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            AgentCash enforces budgets, merchant rules, and human approvals before your assistant ever touches a
            card. Wire it through MCP or the REST API — same engine, same guardrails.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            className="h-11 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 px-6 text-emerald-950 shadow-[0_0_40px_-8px_rgba(52,211,153,0.45)] hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-400"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Open dashboard
            <ArrowRight className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">No credit card required for local / test mode.</span>
        </Reveal>
      </Container>
    </section>
  );
}

