import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelCardAction, decideApproval, updateMandate } from "../actions";
import { McpKeyButton } from "../McpKeyButton";

function fmtUsd(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase
    .from("agents")
    .select("id,name,created_at")
    .eq("id", id)
    .single();
  if (!agent) redirect("/dashboard");

  const { data: mandate } = await supabase
    .from("agent_mandates")
    .select("*")
    .eq("agent_id", id)
    .eq("user_id", user.id)
    .single();

  const monthStart = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  ).toISOString();
  const { data: ledgerRows } = await supabase
    .from("payment_ledger")
    .select("amount_cents,status,mode")
    .eq("agent_id", id)
    .gte("created_at", monthStart);

  const liveCents = (ledgerRows ?? [])
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const shadowCents = (ledgerRows ?? [])
    .filter((r) => r.status === "shadow_approved")
    .reduce((s, r) => s + (r.amount_cents ?? 0), 0);

  const { data: pending } = await supabase
    .from("pending_approvals")
    .select("*")
    .eq("agent_id", id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: cards } = await supabase
    .from("agent_cards")
    .select("*")
    .eq("agent_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: ledger } = await supabase
    .from("payment_ledger")
    .select("id,amount_cents,merchant,intent,source_context,status,mode,card_kind,merchant_lock,expires_at,stripe_card_id,policy_error,created_at")
    .eq("agent_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!mandate) {
    return (
      <main className="mx-auto max-w-xl px-6 py-12">
        <p className="text-sm text-[var(--muted)]">No mandate found for this agent.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-[var(--accent)]">
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-[var(--muted)]">
        Back to agents
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{agent.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Mode:{" "}
            <span className={mandate.shadow_mode ? "text-amber-300" : "text-emerald-300"}>
              {mandate.shadow_mode ? "SHADOW (simulated)" : "LIVE"}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--muted)]">
            Live this month: <span className="font-medium text-[var(--fg)]">{fmtUsd(liveCents)}</span> /{" "}
            {fmtUsd(mandate.monthly_max_cents)}
          </p>
          <p className="text-sm text-[var(--muted)]">
            Shadow this month: <span className="font-medium text-amber-300">{fmtUsd(shadowCents)}</span>
          </p>
        </div>
      </div>

      {pending && pending.length > 0 ? (
        <section className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">Pending approvals</h2>
          <ul className="mt-4 space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="rounded-lg border border-amber-500/30 bg-[var(--card)] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="font-medium">
                    {fmtUsd(p.amount_cents)} to {p.merchant}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{fmtDate(p.created_at)}</span>
                </div>
                <p className="mt-1 text-sm">
                  <span className="text-[var(--muted)]">Intent: </span>
                  {p.intent}
                </p>
                {p.source_context ? (
                  <p className="text-xs text-[var(--muted)]">Source: {p.source_context}</p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Card: {p.card_kind}
                  {p.card_kind === "subscription_lock"
                    ? ` · expires in ${p.subscription_period_days ?? 30}d after approval`
                    : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <form action={decideApproval}>
                    <input type="hidden" name="token" value={p.token} />
                    <input type="hidden" name="agent_id" value={id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-black">
                      Approve
                    </button>
                  </form>
                  <form action={decideApproval}>
                    <input type="hidden" name="token" value={p.token} />
                    <input type="hidden" name="agent_id" value={id} />
                    <input type="hidden" name="decision" value="denied" />
                    <button className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white">
                      Deny
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form
          action={updateMandate}
          className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
        >
          <input type="hidden" name="agent_id" value={id} />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Mandate</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Max per request (USD)</span>
            <input
              name="per_request_dollars"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={(mandate.max_amount_cents_per_request / 100).toFixed(2)}
              className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Monthly max (USD)</span>
            <input
              name="monthly_max_dollars"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={(mandate.monthly_max_cents / 100).toFixed(2)}
              className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Allowed merchants (comma-separated)</span>
            <input
              name="merchants"
              required
              defaultValue={(mandate.allowed_merchants ?? []).join(", ")}
              className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="shadow_mode"
              defaultChecked={mandate.shadow_mode}
              className="h-4 w-4"
            />
            <span>Shadow mode (simulated spend)</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">Require approval above (USD)</span>
              <input
                name="require_approval_above_dollars"
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  mandate.require_approval_above_cents != null
                    ? (mandate.require_approval_above_cents / 100).toFixed(2)
                    : ""
                }
                className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">Approval timeout (s)</span>
              <input
                name="approval_timeout_seconds"
                type="number"
                step="10"
                min="30"
                max="1800"
                defaultValue={mandate.approval_timeout_seconds ?? 180}
                className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
              />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="always_require_approval"
              defaultChecked={mandate.always_require_approval}
              className="h-4 w-4"
            />
            <span>Always require approval</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Approval channel</span>
            <select
              name="approval_channel"
              defaultValue={mandate.approval_channel}
              className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            >
              <option value="none">None</option>
              <option value="slack">Slack</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Slack + WhatsApp</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Slack webhook URL</span>
            <input
              name="slack_webhook_url"
              type="url"
              defaultValue={mandate.slack_webhook_url ?? ""}
              className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">WhatsApp number (E.164)</span>
            <input
              name="whatsapp_to_e164"
              defaultValue={mandate.whatsapp_to_e164 ?? ""}
              className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
            Save changes
          </button>
        </form>

        <div className="flex flex-col gap-6">
          <McpKeyButton agentId={id} />
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Active cards</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {(cards ?? []).length === 0 ? (
                <li className="text-[var(--muted)]">No cards minted yet.</li>
              ) : (
                cards!.map((c) => (
                  <li key={c.id} className="rounded-md border border-[var(--border)] p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {c.card_kind === "subscription_lock" ? "sub-lock" : "single-use"} · {c.merchant_lock} · {fmtUsd(c.amount_cents)}
                      </span>
                      <span
                        className={
                          c.status === "active"
                            ? "text-emerald-300 text-xs"
                            : c.status === "cancelled"
                            ? "text-red-300 text-xs"
                            : "text-[var(--muted)] text-xs"
                        }
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      stripe={c.stripe_card_id} · last4={c.last4 ?? "—"} · created {fmtDate(c.created_at)}
                      {c.expires_at ? ` · expires ${fmtDate(c.expires_at)}` : ""}
                    </p>
                    {c.status === "active" ? (
                      <form action={cancelCardAction} className="mt-2">
                        <input type="hidden" name="card_id" value={c.id} />
                        <input type="hidden" name="agent_id" value={id} />
                        <button className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10">
                          Cancel card
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Recent activity</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Merchant</th>
              <th className="py-2 pr-4">Intent</th>
              <th className="py-2 pr-4">Mode</th>
              <th className="py-2 pr-4">Kind</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {(ledger ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[var(--muted)]">
                  No activity yet.
                </td>
              </tr>
            ) : (
              ledger!.map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)] align-top">
                  <td className="py-2 pr-4 text-xs text-[var(--muted)]">{fmtDate(row.created_at)}</td>
                  <td className="py-2 pr-4">{fmtUsd(row.amount_cents)}</td>
                  <td className="py-2 pr-4">{row.merchant}</td>
                  <td className="py-2 pr-4">
                    <div>{row.intent ?? "—"}</div>
                    {row.source_context ? (
                      <div className="text-xs text-[var(--muted)]">src: {row.source_context}</div>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        row.mode === "shadow"
                          ? "rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200"
                          : "rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200"
                      }
                    >
                      {row.mode}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs">{row.card_kind ?? "—"}</td>
                  <td className="py-2 pr-4 text-xs">
                    {row.status}
                    {row.policy_error ? (
                      <div className="text-[10px] text-red-300">{row.policy_error}</div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
