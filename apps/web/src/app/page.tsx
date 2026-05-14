import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative mx-auto max-w-4xl px-6 pb-24 pt-12 md:pt-16">
      <div className="pointer-events-none absolute inset-x-0 -top-24 flex justify-center opacity-40 blur-3xl">
        <div className="h-64 w-[min(100%,42rem)] rounded-full bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/25" />
      </div>

      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--card-border)] bg-[color:var(--card)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
          Spend rails for AI agents
        </p>

        <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-[color:var(--fg)] md:text-5xl">
          Turn agent spend into something you can trust.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--muted)]">
          AgentCash enforces budgets, merchant rules, and human approvals before your assistant ever touches a card.
          Wire it through MCP or the REST API — same engine, same guardrails.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/login" className="ac-btn-primary inline-flex w-fit px-6 py-3 text-[15px]">
            Open dashboard
          </Link>
          <span className="text-sm text-[color:var(--muted-2)]">No credit card required for local / test mode.</span>
        </div>

        <ul className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Mandates",
              body: "Per-request caps, monthly ceilings, and allowlists so agents cannot improvise limits.",
            },
            {
              title: "Human in the loop",
              body: "Slack, WhatsApp, or magic links when a payment needs a second pair of eyes.",
            },
            {
              title: "Issuing-ready",
              body: "Stripe Issuing test cards with shadow mode — rehearse real flows without surprise bills.",
            },
          ].map((item) => (
            <li key={item.title} className="ac-card p-5 transition hover:border-[color:var(--border-focus)]/40">
              <h2 className="text-sm font-semibold text-emerald-300/90">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
