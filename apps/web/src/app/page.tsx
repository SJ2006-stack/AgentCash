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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Mandate</h1>
      <p className="text-[var(--muted)]">
        Deterministic spend rules for agents. Configure budgets and merchant allowlists, then let your
        assistant request payments only through the MCP gateway.
      </p>
      <Link
        className="inline-flex w-fit rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        href="/login"
      >
        Sign in
      </Link>
    </main>
  );
}
