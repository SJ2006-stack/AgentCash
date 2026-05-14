import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAgentWithMandate } from "../actions";

export default async function NewAgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 md:py-14">
      <Link href="/dashboard" className="ac-muted-link">
        ← Back to agents
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400/80">New agent</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--fg)]">Agent profile & mandate</h1>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
        Set deterministic spend rules. The MCP gateway will block anything outside these bounds and (optionally) ask a
        human via Slack or WhatsApp before approving edge cases.
      </p>

      <form action={createAgentWithMandate} className="ac-card mt-8 flex flex-col gap-8 p-7 md:p-8">
        <section className="grid gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted)]">Basics</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Agent name</span>
            <input
              name="name"
              required
              className="ac-input"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">Max per request (USD)</span>
              <input
                name="per_request_dollars"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="ac-input"
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
                className="ac-input"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Allowed merchants (comma-separated tokens)</span>
            <input
              name="merchants"
              placeholder="aws, digitalocean, stripe_invoices"
              required
              className="ac-input"
            />
            <span className="text-xs text-[var(--muted)]">
              Matching is exact after lowercasing. Agents must use the same token in <code>request_payment</code>.
            </span>
          </label>
        </section>

        <section className="grid gap-4 border-t border-[color:var(--border)] pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted)]">Trust controls</h2>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="shadow_mode"
              className="mt-1 h-4 w-4"
              defaultChecked
            />
            <span>
              <span className="font-medium">Shadow mode</span>
              <br />
              <span className="text-xs text-[var(--muted)]">
                Agent runs end-to-end but no real card is minted. Use this to build trust before going live.
              </span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">Require approval above (USD, optional)</span>
              <input
                name="require_approval_above_dollars"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 50"
                className="ac-input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">Approval timeout (seconds)</span>
              <input
                name="approval_timeout_seconds"
                type="number"
                step="10"
                min="30"
                max="1800"
                defaultValue={180}
                className="ac-input"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="always_require_approval" className="h-4 w-4" />
            <span>Always require approval (regardless of amount)</span>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Approval channel</span>
            <select name="approval_channel" defaultValue="none" className="ac-input cursor-pointer">
              <option value="none">None</option>
              <option value="slack">Slack</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Slack + WhatsApp</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">Slack incoming webhook URL</span>
              <input
                name="slack_webhook_url"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                className="ac-input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--muted)]">WhatsApp number (E.164)</span>
              <input
                name="whatsapp_to_e164"
                placeholder="+15551234567"
                className="ac-input"
              />
            </label>
          </div>
        </section>

        <button type="submit" className="ac-btn-primary w-full py-3 text-[15px] sm:w-auto sm:self-start">
          Create agent
        </button>
      </form>
    </main>
  );
}
