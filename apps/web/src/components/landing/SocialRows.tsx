import { Bot, CreditCard, FolderGit, MessageCircle, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const integrations = [
  { label: "Stripe Issuing", icon: CreditCard },
  { label: "Slack approvals", icon: MessagesSquare },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "MCP agents", icon: Bot },
] as const;

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: FolderGit },
  { label: "X", href: "https://x.com", icon: XIcon },
] as const;

export function SocialRows() {
  return (
    <section className="border-t border-border/60 py-10">
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Works with</p>
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
      <p className="text-sm text-muted-foreground">Follow AgentCash</p>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 fill-current", className)} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
