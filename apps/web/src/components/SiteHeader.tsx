import Link from "next/link";

/** Global top bar — brand only so dashboard vs marketing stays consistent. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-sm font-bold tracking-tight text-slate-950 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 transition group-hover:shadow-emerald-400/35"
            aria-hidden
          >
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[color:var(--fg)]">AgentCash</span>
        </Link>
      </div>
    </header>
  );
}
