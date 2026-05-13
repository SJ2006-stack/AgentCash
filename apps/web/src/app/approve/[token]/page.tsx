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
      <main className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-xl font-semibold">Unknown approval link</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">This token does not exist or has been cleared.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-xl font-semibold">Mandate approval</h1>
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm">
          <span className="text-[var(--muted)]">Amount:</span> {fmtUsd(row.amount_cents)}
        </p>
        <p className="text-sm">
          <span className="text-[var(--muted)]">Merchant:</span> {row.merchant}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-[var(--muted)]">Intent:</span> {row.intent}
        </p>
        {row.source_context ? (
          <p className="text-xs text-[var(--muted)]">Source: {row.source_context}</p>
        ) : null}
        <p className="mt-2 text-xs text-[var(--muted)]">
          Card: {row.card_kind}
          {row.card_kind === "subscription_lock"
            ? ` · expires ${row.subscription_period_days ?? 30}d after approval`
            : ""}
        </p>

        <div className="mt-6 flex items-center gap-3">
          {row.status === "pending" ? (
            <>
              <form action={decide}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="approved" />
                <button className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black">
                  Approve
                </button>
              </form>
              <form action={decide}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="denied" />
                <button className="rounded-md bg-red-500/80 px-4 py-2 text-sm font-medium text-white">
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
      <p className="mt-4 text-xs text-[var(--muted)]">
        Approvals are token-scoped: anyone with this URL can decide, so treat it like a one-time code.
      </p>
    </main>
  );
}
