import { createBrowserClient } from "@supabase/ssr";

/** Injected in `app/layout.tsx` from Worker env so the browser client works without build-time inlining. */
declare global {
  interface Window {
    __NEXT_PUBLIC_SUPABASE__?: { url: string; anonKey: string };
  }
}

function getBrowserPublicSupabase(): { url: string; anonKey: string } {
  if (typeof window !== "undefined") {
    const injected = window.__NEXT_PUBLIC_SUPABASE__;
    if (injected?.url && injected?.anonKey) return injected;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them on the Cloudflare Worker (or Pages) and ensure the root layout can read them, or use apps/web/.env.local for local dev.",
  );
}

export function createClient() {
  const { url, anonKey } = getBrowserPublicSupabase();
  return createBrowserClient(url, anonKey);
}
