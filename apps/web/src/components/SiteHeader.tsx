import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const nav = [
  { label: "Demo", href: "#demo" },
  { label: "Platform", href: "#platform" },
  { label: "Roadmap", href: "#roadmap" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--bg)]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-emerald-400/30 bg-gradient-to-br from-emerald-400/90 via-teal-400/80 to-cyan-500/70 font-mono text-sm font-bold tracking-tight text-slate-950 shadow-[0_0_24px_-4px_rgba(52,211,153,0.45)]"
            aria-hidden
          >
            $
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[color:var(--fg)]">AgentCash</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--fg)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="hidden border-amber-400/25 bg-amber-400/10 text-amber-200/90 sm:inline-flex"
          >
            Task Router — soon
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="hidden border-white/12 bg-white/[0.03] text-[color:var(--fg)] sm:inline-flex"
            render={<a href="#roadmap" />}
            nativeButton={false}
          >
            Notify me
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[0_0_28px_-8px_rgba(52,211,153,0.5)]"
            render={<a href="#demo" />}
            nativeButton={false}
          >
            Watch demo
          </Button>
        </div>
      </div>
    </header>
  );
}
