import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
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
    "Coming soon: micro-payments for AI agents. x402 USDC on Base — budgets, task routing, and approvals before a cent leaves your wallet.",
  openGraph: {
    title: "AgentCash — micro-payments for AI agents",
    description:
      "x402 USDC payments, task routing, and guardrails for autonomous agents. Open source CLI and registry.",
    type: "website",
    siteName: "AgentCash",
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
        <MotionProvider>
          <SiteHeader />
          <ScrollProgress className="top-14 sm:top-16" />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
