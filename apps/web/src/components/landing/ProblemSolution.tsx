import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

const problems = [
  "Agents call paid APIs with no spend ceiling",
  "One compromised tool can drain a shared wallet",
  "Humans find out after the invoice, not before the charge",
] as const;

const solutions = [
  "Hard budgets per task, enforced before settlement",
  "Merchant allowlists and policy gates on every x402 intent",
  "Approval flows when spend crosses your threshold",
] as const;

export function ProblemSolution() {
  return (
    <Section id="problem" className="scroll-mt-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The gap"
            title={
              <>
                Agents can spend money.{" "}
                <GradientText variant="warm">Nothing stops them.</GradientText>
              </>
            }
            description="Autonomous runs need payment rails — but credit cards and shared API keys weren't designed for machines making thousands of micro-decisions."
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal delay={0.05}>
            <NarrativeCard
              variant="problem"
              title="Without guardrails"
              items={problems}
              icon={AlertTriangle}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <NarrativeCard
              variant="solution"
              title="With AgentCash"
              items={solutions}
              icon={CheckCircle2}
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function NarrativeCard({
  variant,
  title,
  items,
  icon: Icon,
}: {
  variant: "problem" | "solution";
  title: string;
  items: readonly string[];
  icon: typeof AlertTriangle;
}) {
  const isSolution = variant === "solution";

  return (
    <div
      className={cn(
        "ac-card h-full p-8",
        isSolution && "border-emerald-400/20 bg-emerald-400/[0.03]",
      )}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border",
            isSolution
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              : "border-rose-400/20 bg-rose-400/10 text-rose-300",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <Eyebrow className={isSolution ? "text-emerald-300/80" : "text-rose-300/80"}>
            {isSolution ? "Solution" : "Problem"}
          </Eyebrow>
          <h3 className="ac-h3 mt-1 text-foreground">{title}</h3>
        </div>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[length:var(--ac-text-body)] leading-[var(--ac-text-body-lh)] text-muted-foreground">
            <span
              className={cn(
                "mt-2 size-1.5 shrink-0 rounded-full",
                isSolution ? "bg-emerald-400" : "bg-rose-400/70",
              )}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
