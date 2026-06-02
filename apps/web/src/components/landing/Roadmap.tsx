import { CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const items: {
  label: string;
  status: string;
  phase: string;
  highlight?: boolean;
}[] = [
  { label: "Task Router", status: "In design", phase: "Now", highlight: true },
  { label: "x402 settlement", status: "CLI shipping", phase: "Q2" },
  { label: "Agent registry", status: "Curated YAML", phase: "Q2" },
  { label: "Public dashboard", status: "app.agentcash.tech", phase: "Next" },
];

export function Roadmap() {
  return (
    <Section id="roadmap" className="scroll-mt-24 border-t border-border/50">
      <Container size="md">
        <Reveal>
          <SectionHeading
            eyebrow="Roadmap"
            title="What ships next"
            description="We are rebuilding the stack around micro-payments and task routing — no legacy mandate UI."
          />
        </Reveal>

        <ol className="relative mt-12 space-y-0 pl-1">
          <div
            className="pointer-events-none absolute top-3 bottom-3 left-[11px] w-px bg-gradient-to-b from-emerald-400/40 via-white/10 to-transparent"
            aria-hidden
          />
          {items.map((item, index) => (
            <Reveal key={item.label} delay={0.05 * index}>
              <li className="relative grid grid-cols-[24px_1fr] gap-4 pb-6 last:pb-0">
                <span className="relative z-10 mt-5 flex size-6 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                  <CircleDashed className="size-3.5 text-emerald-400/80" aria-hidden />
                </span>
                <article
                  className={cn(
                    "ac-card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                    item.highlight && "border-amber-400/25 bg-amber-400/[0.04]",
                  )}
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {item.phase}
                    </p>
                    <h3 className="mt-1 font-medium text-foreground">{item.label}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.highlight
                        ? "w-fit border-amber-400/30 bg-amber-400/10 text-amber-200/90"
                        : "w-fit border-white/10 bg-white/[0.03] text-muted-foreground"
                    }
                  >
                    {item.status}
                  </Badge>
                </article>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
