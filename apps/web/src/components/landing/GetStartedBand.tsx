import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GradientText } from "@/components/ui/GradientText";
import { getStarted, URLS } from "@/content/landing";
import { Reveal } from "@/components/landing/Reveal";

export function GetStartedBand() {
  return (
    <section id="get-started" className="scroll-mt-24 border-y border-[color:var(--ac-border)] py-[var(--ac-section-y)]">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="ac-h2 text-foreground">
              {getStarted.titleLead} <GradientText>{getStarted.titleAccent}</GradientText>
              {getStarted.titleTail}
            </h2>
            <p className="mt-4 text-[length:var(--ac-text-body-lg)] leading-[var(--ac-text-body-lg-lh)] text-muted-foreground">
              {getStarted.description}
            </p>
          </div>
        </Reveal>

        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {getStarted.tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={0.05 * index}>
              <li
                className={
                  "highlight" in tier && tier.highlight
                    ? "ac-card relative border-emerald-400/25 bg-emerald-400/[0.04] p-6"
                    : "ac-card p-6"
                }
              >
                {"highlight" in tier && tier.highlight ? (
                  <span className="absolute -top-3 left-6 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                    Popular
                  </span>
                ) : null}
                <p className="text-sm font-medium text-muted-foreground">{tier.name}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{tier.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tier.detail}</p>
                <ul className="mt-6 space-y-2 border-t border-white/8 pt-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="text-sm text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.15} className="mt-12 flex justify-center">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 px-8 text-emerald-950 shadow-[var(--ac-shadow-glow)]"
            render={<a href={URLS.waitlist} />}
            nativeButton={false}
          >
            <Sparkles className="size-4" aria-hidden />
            {getStarted.cta}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
