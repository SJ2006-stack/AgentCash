import { CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";

const items: { label: string; status: string; highlight?: boolean }[] = [
  { label: "Task Router", status: "In design", highlight: true },
  { label: "x402 settlement", status: "Coming soon" },
  { label: "Agent registry", status: "Coming soon" },
  { label: "Public CLI", status: "Coming soon" },
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

        <ul className="mt-10 space-y-3">
          {items.map((item, index) => (
            <Reveal key={item.label} delay={0.04 * index}>
              <li className="ac-card flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <CircleDashed
                    className="size-4 shrink-0 text-emerald-400/70"
                    aria-hidden
                  />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.highlight
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-200/90"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground"
                  }
                >
                  {item.status}
                </Badge>
              </li>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
