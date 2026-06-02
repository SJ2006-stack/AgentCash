import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const worksWith = [
  { name: "x402", sub: "HTTP 402 payments" },
  { name: "Base", sub: "L2 settlement" },
  { name: "USDC", sub: "Stable settlement" },
  { name: "Cloudflare", sub: "Edge deploy" },
] as const;

const metrics = [
  { value: "10k+", label: "Micro-payments routed", note: "Illustrative" },
  { value: "<$0.01", label: "Typical per-call spend", note: "Illustrative" },
  { value: "24/7", label: "Agent-ready settlement", note: "Illustrative" },
] as const;

export function SocialRows() {
  return (
    <Section id="trust" className="scroll-mt-24 border-t border-border/50 py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Social proof"
            title="Built for agents, wired to the stack you already use"
            description="AgentCash sits on open payment rails — x402 merchants, USDC on Base, and edge hosting. Metrics below are placeholders until we publish live totals."
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        <Reveal delay={0.06} className="mt-12">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Works with
          </p>
          <LogoMarquee />
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <Reveal key={metric.label} delay={0.04 * index}>
              <li className="ac-card flex flex-col items-center px-6 py-8 text-center">
                <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
                  {metric.value}
                </span>
                <span className="mt-2 text-sm text-foreground/90">{metric.label}</span>
                <span className="mt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  {metric.note}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function LogoMarquee() {
  const track = [...worksWith, ...worksWith];
  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      aria-hidden
    >
      <div className="ac-marquee-track flex w-max items-center gap-10 px-4 sm:gap-14">
        {track.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/[0.02] px-8 py-4"
          >
            <span className="text-lg font-semibold tracking-tight text-foreground/90">{logo.name}</span>
            <span className="text-xs text-muted-foreground">{logo.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
