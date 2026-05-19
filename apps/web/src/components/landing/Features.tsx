import type { LucideIcon } from "lucide-react";
import { CreditCard, ShieldCheck, Users } from "lucide-react";
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
    title: "Mandates",
    description: "Per-request caps, monthly ceilings, and allowlists so agents cannot improvise limits.",
    icon: ShieldCheck,
  },
  {
    title: "Human in the loop",
    description: "Slack, WhatsApp, or magic links when a payment needs a second pair of eyes.",
    icon: Users,
  },
  {
    title: "Issuing-ready",
    description: "Stripe Issuing test cards with shadow mode — rehearse real flows without surprise bills.",
    icon: CreditCard,
  },
];

export function Features() {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Platform"
            title="Guardrails built for autonomous spend"
            description="Every path — MCP, REST, or dashboard — runs through the same mandate engine."
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
      <Card className="h-full border-white/10 bg-white/[0.02] ring-white/10 transition hover:border-emerald-400/20 hover:bg-white/[0.04]">
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
