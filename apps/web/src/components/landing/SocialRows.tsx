import { Bot, Coins, Route, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const integrations = [
  { label: "x402", icon: Coins },
  { label: "Task Router", icon: Route },
  { label: "Agent wallets", icon: Wallet },
  { label: "Tooling / MCP", icon: Bot },
] as const;

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
] as const;

export function SocialRows() {
  return (
    <section className="border-t border-border/60 py-10 pb-16">
      <Container className="flex flex-col gap-8">
        <IntegrationRow />
        <Separator className="bg-border/60" />
        <SocialLinksRow />
      </Container>
    </section>
  );
}

function IntegrationRow() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">On the roadmap</p>
      <ul className="flex flex-wrap items-center gap-2">
        {integrations.map(({ label, icon: Icon }) => (
          <li key={label}>
            <Badge variant="outline" className="gap-2 border-white/10 bg-white/[0.03] px-3 py-1.5 text-foreground/80">
              <Icon className="size-3.5 text-emerald-400/90" aria-hidden />
              {label}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLinksRow() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">AgentCash · micro-payments for agents</p>
      <div className="flex items-center gap-2">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <Button
            key={label}
            variant="outline"
            size="icon"
            className="border-white/10 bg-white/[0.02] text-muted-foreground hover:border-emerald-400/25 hover:text-foreground"
            render={<a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} />}
            nativeButton={false}
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 fill-current", className)} aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 fill-current", className)} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
