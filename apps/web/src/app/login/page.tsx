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
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6 py-14 md:py-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--fg)]">
          {mode === "signin" ? "Welcome back" : "Create your workspace"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
          Email and password auth. Enable the Email provider in Supabase Auth if you have not already.
        </p>
      </div>

      <form className="ac-card flex flex-col gap-5 p-7" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[color:var(--muted)]">Email</span>
          <input
            className="ac-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[color:var(--muted)]">Password</span>
          <input
            className="ac-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>
        {error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-[color:var(--danger)]">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading} className="ac-btn-primary w-full py-3">
          {loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="text-center text-sm text-[color:var(--muted)] underline-offset-4 transition hover:text-[color:var(--fg)] hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>

      <Link href="/" className="ac-muted-link text-center">
        ← Back to home
      </Link>
    </main>
  );
}
