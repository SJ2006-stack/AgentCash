import type { LucideIcon } from "lucide-react";
import { Gauge, Route, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const features: {
  title: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
}[] = [
  {
    title: "Micro-budgets",
    description: "Cap every run at cents, not cards — hard stops before an agent overspends.",
    icon: Gauge,
    featured: true,
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
  {
    title: "Agent wallets",
    description: "Dedicated wallets per agent or environment — testnet today, mainnet when you're ready.",
    icon: Wallet,
  },
];

export function Features() {
  return (
    <Section id="platform" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Platform"
            title="Spend rails built for autonomous runs"
            description="One control plane for CLI agents, HTTP tools, and future registry integrations — same guardrails everywhere."
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={0.05 * index}
              className={cn(feature.featured && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}
            >
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
  featured,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
}) {
  return (
    <li className="h-full list-none">
      <Card
        className={cn(
          "h-full border-white/10 bg-white/[0.02] ring-white/10 transition hover:border-emerald-400/25 hover:bg-white/[0.04]",
          featured && "border-emerald-400/20 bg-emerald-400/[0.03] lg:min-h-[280px]",
        )}
      >
        <CardHeader className="gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Icon className="size-5" aria-hidden />
          </div>
          <CardTitle className="ac-h4 text-emerald-300/90">{title}</CardTitle>
        </CardHeader>
        <CardContent className="-mt-2">
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">{description}</CardDescription>
        </CardContent>
      </Card>
    </li>
  );
}
