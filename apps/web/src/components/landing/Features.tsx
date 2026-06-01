import type { LucideIcon } from "lucide-react";
import { Gauge, Route, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const features: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Micro-budgets",
    description: "Cap every run at cents, not cards — hard stops before an agent overspends.",
    icon: Gauge,
  },
  {
    title: "Task Router",
    description: "Queue work, attach policy, and release funds only when the task is allowed to proceed.",
    icon: Route,
  },
  {
    title: "Human approvals",
    description: "Escalate edge cases to Slack, email, or magic links when spend needs a second pair of eyes.",
    icon: ShieldCheck,
  },
];

export function Features() {
  return (
    <Section id="platform" className="scroll-mt-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Platform"
            title="Spend rails built for autonomous runs"
            description="One control plane for CLI agents, HTTP tools, and future registry integrations — same guardrails everywhere."
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={0.05 * index}>
              <FeatureCard {...feature} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <li>
      <Card className="h-full border-white/10 bg-white/[0.02] ring-white/10 transition hover:border-emerald-400/25 hover:bg-white/[0.04]">
        <CardHeader className="gap-4">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-base text-emerald-300/90">{title}</CardTitle>
        </CardHeader>
        <CardContent className="-mt-2">
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">{description}</CardDescription>
        </CardContent>
      </Card>
    </li>
  );
}
