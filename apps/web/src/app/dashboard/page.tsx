import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agents } = await supabase.from("agents").select("id,name,created_at").order("created_at", {
    ascending: false,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <div className="flex flex-col gap-6 border-b border-[color:var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--fg)]">Agents</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[color:var(--muted)]">
            Each agent has a mandate: per-request cap, monthly cap, and allowed merchants. MCP and REST calls are
            checked against the same rules.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <form action={signOut}>
            <button type="submit" className="ac-btn-secondary px-4 py-2.5 text-sm">
              Sign out
            </button>
          </form>
          <Link href="/dashboard/agents/new" className="ac-btn-primary px-5 py-2.5 text-sm">
            New agent
          </Link>
        </div>
      </div>

      <ul className="mt-10 space-y-3">
        {(agents ?? []).length === 0 ? (
          <li className="ac-card border-dashed border-[color:var(--border)] p-10 text-center">
            <p className="text-sm text-[color:var(--muted)]">No agents yet.</p>
            <p className="mt-2 text-sm text-[color:var(--muted-2)]">
              Create one to define spend rules and mint an MCP key.
            </p>
            <Link href="/dashboard/agents/new" className="ac-btn-primary mt-6 inline-flex text-sm">
              Create first agent
            </Link>
          </li>
        ) : (
          (agents ?? []).map((a) => (
            <li key={a.id}>
              <Link
                href={`/dashboard/agents/${a.id}`}
                className="ac-card group flex items-center justify-between gap-4 px-5 py-4 transition hover:border-emerald-500/35 hover:shadow-[0_0_32px_-8px_rgba(52,211,153,0.12)]"
              >
                <div className="min-w-0">
                  <span className="block truncate font-semibold text-[color:var(--fg)]">{a.name}</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--muted)]">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
                <span
                  className="text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-emerald-400/90"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
