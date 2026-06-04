import { ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

import { docsPreview, URLS } from "@/content/landing";
import { Reveal } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function DocsPreview() {
  return (
    <Section id="docs" className="scroll-mt-24 border-t border-[color:var(--ac-border)]">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={docsPreview.eyebrow}
            title={docsPreview.title}
            description={docsPreview.description}
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docsPreview.guides.map((guide, index) => (
            <Reveal key={guide.title} delay={0.04 * index}>
              <li className="h-full list-none">
                <DocGuideCard {...guide} />
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.12} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            className="min-w-[12.5rem] gap-2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[var(--ac-shadow-glow)]"
            render={
              <a
                href={URLS.docs}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open AgentCash documentation (opens in a new tab)"
              />
            }
            nativeButton={false}
          >
            <BookOpen className="size-4" aria-hidden />
            {docsPreview.primaryCta}
            <ExternalLink className="size-3.5 opacity-80" aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-[12.5rem] gap-2 border-white/12 bg-white/[0.02] text-foreground hover:border-emerald-400/30"
            render={
              <a
                href={URLS.status}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View AgentCash status (opens in a new tab)"
              />
            }
            nativeButton={false}
          >
            {docsPreview.secondaryCta}
            <ArrowRight className="size-4 text-emerald-400/80" aria-hidden />
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}

function DocGuideCard({
  title,
  description,
  href,
  tag,
}: (typeof docsPreview.guides)[number]) {
  const external = href.startsWith("http");

  const card = (
    <article
      className={cn(
        "ac-card group flex h-full flex-col p-6 transition",
        "hover:border-emerald-400/25 hover:bg-white/[0.03]",
      )}
    >
      <span className="w-fit rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-300/90">
        {tag}
      </span>
      <h3 className="ac-h4 mt-4 text-foreground group-hover:text-emerald-300/95">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400/90">
        Learn more
        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </article>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45"
        aria-label={`${title} (opens in a new tab)`}
      >
        {card}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="block h-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45"
    >
      {card}
    </Link>
  );
}
