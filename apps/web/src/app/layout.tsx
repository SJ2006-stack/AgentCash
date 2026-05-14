import type { Metadata } from "next";
import { readWorkerEnv } from "@/lib/env/worker-env";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mandate",
  description: "Deterministic spend rules for agent payments",
};

function publicSupabaseInlineScript(): string | null {
  const url = readWorkerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readWorkerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;
  return `globalThis.__NEXT_PUBLIC_SUPABASE__=${JSON.stringify({ url, anonKey })};`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const inlineEnv = publicSupabaseInlineScript();
  return (
    <html lang="en">
      <head>
        {inlineEnv ? (
          <script
            // Cloudflare/Pages runtime vars are not inlined at build; expose public Supabase config to the browser.
            dangerouslySetInnerHTML={{ __html: inlineEnv }}
          />
        ) : null}
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
