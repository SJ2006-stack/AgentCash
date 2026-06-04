import Link from "next/link";
import { Container } from "@/components/ui/Container";

const FOOTER_LINKS = [
  { label: "Documentation", href: "https://docs.agentcash.tech" },
  { label: "Status", href: "https://status.agentcash.tech" },
  { label: "Contact", href: "mailto:hello@agentcash.tech" },
  { label: "API health", href: "/api/v1/health" },
] as const;

function isExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--ac-border)] bg-[#040608]/90 pb-10 pt-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="grid size-9 place-items-center rounded-[10px] border border-emerald-400/30 bg-gradient-to-br from-emerald-400/90 via-teal-400/80 to-cyan-500/70 font-mono text-sm font-bold text-slate-950"
                aria-hidden
              >
                $
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">AgentCash</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Micro-payments and task routing for autonomous agents — x402, USDC on Base, open source CLI.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/85">Links</p>
            <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  {isExternalHref(link.href) ? (
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[color:var(--ac-border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">© {year} AgentCash. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/70">Open source · x402 · USDC on Base</p>
        </div>
      </Container>
    </footer>
  );
}
