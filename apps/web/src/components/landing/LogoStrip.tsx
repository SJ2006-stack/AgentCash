import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/landing/Reveal";

const logos = [
  "OpenAI Agents",
  "Coinbase x402",
  "Anthropic",
  "LangChain",
  "Vercel AI",
  "Cloudflare",
] as const;

export function LogoStrip() {
  return (
    <section aria-label="Trusted by teams building with agents" className="border-y border-[color:var(--ac-border)] py-10">
      <Container>
        <Reveal>
          <p className="text-center text-[length:var(--ac-text-caption)] font-medium uppercase tracking-[0.16em] text-[color:var(--ac-fg-subtle)]">
            Built for the next wave of agent infrastructure
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((name) => (
              <li
                key={name}
                className="text-sm font-medium tracking-tight text-[color:var(--ac-fg-muted)]/70 transition-colors hover:text-[color:var(--ac-fg-muted)]"
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
