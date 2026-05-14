import { decideApprovalRpc, getServiceClient } from "@/lib/supabase/service";

function fmtUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

async function decide(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!token || (decision !== "approved" && decision !== "denied")) return;
  const sb = getServiceClient();
  await decideApprovalRpc(sb, {
    token,
    decision,
    via: "magic_link",
    actor: "magic_link",
  });
}

export default async function ApprovePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { token } = await params;
  const { d } = await searchParams;
  const sb = getServiceClient();

  if (d === "approve" || d === "deny") {
    await decideApprovalRpc(sb, {
      token,
      decision: d === "approve" ? "approved" : "denied",
      via: "magic_link",
      actor: "magic_link",
    });
  }

  const { data: row } = await sb
    .from("pending_approvals")
    .select("amount_cents, merchant, intent, source_context, card_kind, subscription_period_days, status, decided_via, decided_at")
    .eq("token", token)
    .maybeSingle();

  if (!row) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/90">Approval</p>
        <h1 className="mt-2 text-2xl font-bold text-[color:var(--fg)]">Link not found</h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">This token does not exist or has already been used.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-14 md:py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">AgentCash</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[color:var(--fg)]">Approve spend</h1>
      <div className="ac-card mt-8 p-7">
        <p className="text-sm text-[color:var(--muted)]">
          <span className="text-[color:var(--muted-2)]">Amount:</span>{" "}
          <span className="font-semibold text-[color:var(--fg)]">{fmtUsd(row.amount_cents)}</span>
        </p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          <span className="text-[color:var(--muted-2)]">Merchant:</span>{" "}
          <span className="text-[color:var(--fg)]">{row.merchant}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--fg)]">
          <span className="text-[color:var(--muted-2)]">Intent:</span> {row.intent}
        </p>
        {row.source_context ? (
          <p className="mt-2 text-xs text-[color:var(--muted)]">Source: {row.source_context}</p>
        ) : null}
        <p className="mt-3 text-xs text-[color:var(--muted)]">
          Card: {row.card_kind}
          {row.card_kind === "subscription_lock"
            ? ` · expires ${row.subscription_period_days ?? 30}d after approval`
            : ""}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {row.status === "pending" ? (
            <>
              <form action={decide}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="approved" />
                <button type="submit" className="ac-btn-primary px-5 py-2.5 text-sm">
                  Approve
                </button>
              </form>
              <form action={decide}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="denied" />
                <button
                  type="submit"
                  className="rounded-lg border border-red-500/40 bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25"
                >
                  Deny
                </button>
              </form>
            </>
          ) : (
            <p
              className={
                row.status === "approved"
                  ? "text-emerald-300"
                  : row.status === "denied"
                  ? "text-red-300"
                  : "text-[var(--muted)]"
              }
            >
              Status: {row.status}
              {row.decided_via ? ` (via ${row.decided_via})` : ""}
            </p>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-[color:var(--muted)]">
        This link acts like a one-time code — anyone with the URL can decide while the request is pending.
      </p>
    </main>
  );
}
