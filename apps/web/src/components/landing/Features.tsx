import type { LucideIcon } from "lucide-react";
import { Gauge, Route, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { features as featureCopy, featuresSection } from "@/content/landing";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const featureIcons = [Gauge, Route, ShieldCheck, Wallet] as const;

const features = featureCopy.map((feature, index) => ({
  ...feature,
  icon: featureIcons[index] ?? Wallet,
}));

export function Features() {
  return (
    <Section id="platform" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={featuresSection.eyebrow}
            title={featuresSection.title}
            description={featuresSection.description}
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={0.05 * index}
              className={cn(
                "featured" in feature && feature.featured && "sm:col-span-2 lg:col-span-1 lg:row-span-2",
              )}
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
