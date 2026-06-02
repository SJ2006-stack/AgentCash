import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  placeholder?: boolean;
};

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "#platform" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "FAQ", href: "#faq" },
      { label: "Status", href: "https://status.agentcash.tech", external: true },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "https://docs.agentcash.tech", external: true },
      { label: "Developers", href: "#developers" },
      { label: "GitHub", href: "https://github.com", external: true, placeholder: true },
      { label: "Registry", href: "https://github.com", external: true, placeholder: true },
      { label: "API health", href: "/api/v1/health" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "AgentCash", href: "https://agentcash.tech", external: true },
      { label: "Contact", href: "mailto:hello@agentcash.tech", external: true, placeholder: true },
      { label: "Privacy", href: "https://agentcash.tech/privacy", external: true, placeholder: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "https://agentcash.tech/terms", external: true, placeholder: true },
      { label: "Privacy policy", href: "https://agentcash.tech/privacy", external: true, placeholder: true },
      { label: "legal@agentcash.tech", href: "mailto:legal@agentcash.tech", external: true },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--ac-border)] bg-[#040608]/90 pb-10 pt-14">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="grid size-9 place-items-center rounded-[10px] border border-emerald-400/30 bg-gradient-to-br from-emerald-400/90 via-teal-400/80 to-cyan-500/70 font-mono text-sm font-bold text-slate-950"
                aria-hidden
              >
                $
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">AgentCash</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Micro-payments and task routing for autonomous agents — x402, USDC on Base, open source CLI.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/85">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => {
                  const className = cn(
                    "text-sm text-muted-foreground transition-colors hover:text-foreground",
                    link.placeholder && "opacity-85",
                  );
                  const child = (
                    <>
                      {link.label}
                      {link.placeholder ? (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/55">
                          soon
                        </span>
                      ) : null}
                    </>
                  );

                  return (
                    <li key={`${col.title}-${link.label}`}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {child}
                        </a>
                      ) : (
                        <Link href={link.href} className={className}>
                          {child}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[color:var(--ac-border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">© {year} AgentCash. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/70">Open source · x402 · USDC on Base</p>
        </div>
      </Container>
    </footer>
  );
}
