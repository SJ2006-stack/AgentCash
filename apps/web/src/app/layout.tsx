import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "AgentCash — micro-payments for AI agents",
  description:
    "Give an AI $0.10 and a task. AgentCash routes spend through guardrails — task router, budgets, and approvals coming soon.",
  openGraph: {
    title: "AgentCash",
    description: "Micro-payments and task routing for autonomous agents.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("dark font-sans", dmSans.variable, geistMono.variable, jetbrainsMono.variable)}
    >
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
