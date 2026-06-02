"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Product", href: "#platform" },
  { label: "Docs", href: "https://docs.agentcash.tech", external: true },
  { label: "Developers", href: "#developers" },
  { label: "How it works", href: "#how-it-works" },
] as const;

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
  });

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-50 border-b transition-[border-color,background-color,box-shadow] duration-300",
          scrolled
            ? "border-[color:var(--ac-border)] bg-[color:var(--ac-bg)]/78 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            : "border-transparent bg-[color:var(--ac-bg)]/45 backdrop-blur-md",
        )}
      >
        <Container className="flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link href="/" className="group flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span
              className="grid size-8 place-items-center rounded-[9px] border border-emerald-400/35 bg-gradient-to-br from-emerald-400/90 via-teal-400/75 to-cyan-500/65 font-mono text-xs font-bold tracking-tight text-slate-950 shadow-[var(--ac-shadow-glow)] transition group-hover:shadow-[0_0_28px_-4px_rgba(52,211,153,0.55)] sm:size-9 sm:rounded-[10px] sm:text-sm"
              aria-hidden
            >
              $
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">AgentCash</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
                {...("external" in item && item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              GitHub
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              className="hidden bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[var(--ac-shadow-glow)] sm:inline-flex"
              render={<a href="#get-started" />}
              nativeButton={false}
            >
              Get started
            </Button>

            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-foreground transition hover:border-emerald-400/25 hover:bg-white/[0.06] md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </Container>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              id="mobile-nav"
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l border-[color:var(--ac-border)] bg-[color:var(--ac-bg-elevated)]/95 p-6 shadow-2xl backdrop-blur-xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              aria-label="Mobile"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-semibold tracking-tight text-foreground">Menu</span>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-foreground"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <ul className="flex flex-col gap-1">
                {[...nav, { label: "GitHub", href: "https://github.com", external: true as const }].map(
                  (item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-3 text-base text-foreground transition hover:bg-white/[0.04]"
                        onClick={() => setMenuOpen(false)}
                        {...("external" in item && item.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ),
                )}
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950"
                  render={<a href="#get-started" onClick={() => setMenuOpen(false)} />}
                  nativeButton={false}
                >
                  Get started
                </Button>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
