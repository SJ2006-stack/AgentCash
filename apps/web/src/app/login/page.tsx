"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else router.push("/dashboard");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Email and password auth for v0.1. Enable Email provider in Supabase Auth settings.
        </p>
      </div>
      <form className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <input
            className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Password</span>
          <input
            className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          className="text-sm text-[var(--muted)] underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
      <Link className="text-sm text-[var(--muted)]" href="/">
        Back
      </Link>
    </main>
  );
}
