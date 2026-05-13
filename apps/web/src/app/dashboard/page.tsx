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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Agents</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Each agent has a mandate: per-request cap, monthly cap, and allowed merchants.
          </p>
        </div>
        <div className="flex gap-3">
          <form action={signOut}>
            <button type="submit" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              Sign out
            </button>
          </form>
          <Link
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            href="/dashboard/agents/new"
          >
            New agent
          </Link>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {(agents ?? []).length === 0 ? (
          <li className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            No agents yet. Create one to define spend rules and generate an MCP key.
          </li>
        ) : (
          (agents ?? []).map((a) => (
            <li key={a.id}>
              <Link
                href={`/dashboard/agents/${a.id}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 hover:border-[var(--accent)]"
              >
                <span className="font-medium">{a.name}</span>
                <span className="text-xs text-[var(--muted)]">{new Date(a.created_at).toLocaleString()}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
