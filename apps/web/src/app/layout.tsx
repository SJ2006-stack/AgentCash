import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { readWorkerEnv } from "@/lib/env/worker-env";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "AgentCash",
  description: "Spend rails for AI agents — mandates, approvals, and Issuing test cards.",
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
    <html lang="en" className={dmSans.variable}>
      <head>
        {inlineEnv ? (
          <script
            // Cloudflare/Pages runtime vars are not inlined at build; expose public Supabase config to the browser.
            dangerouslySetInnerHTML={{ __html: inlineEnv }}
          />
        ) : null}
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif" }}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
