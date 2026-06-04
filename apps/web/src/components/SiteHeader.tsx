"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/lib/motion";
import { Container } from "@/components/ui/Container";
import { nav, URLS } from "@/content/landing";
import { cn } from "@/lib/utils";

const navLinkClass =
  "rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ac-bg)]";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
  });

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ac-bg)]"
            aria-label="AgentCash home"
            onClick={() => setMenuOpen(false)}
          >
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
                className={navLinkClass}
                {...(item.external
                  ? {
                      target: item.href.startsWith("mailto:") ? undefined : "_blank",
                      rel: item.href.startsWith("mailto:") ? undefined : "noopener noreferrer",
                      ...(item.href.startsWith("http")
                        ? { "aria-label": `${item.label} (opens in a new tab)` }
                        : {}),
                    }
                  : {})}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              className="hidden bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-[var(--ac-shadow-glow)] sm:inline-flex"
              render={
                <a href={URLS.waitlist} aria-label="Join the AgentCash waitlist by email" />
              }
              nativeButton={false}
            >
              Join waitlist
            </Button>

            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-foreground transition hover:border-emerald-400/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 md:hidden"
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
              transition={
                reduceMotion
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 380, damping: 36 }
              }
              aria-label="Mobile"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-semibold tracking-tight text-foreground">Navigation</span>
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
                {nav.map(
                  (item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-3 text-base text-foreground transition hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45"
                        onClick={() => setMenuOpen(false)}
                        {...(item.external
                          ? {
                              target: item.href.startsWith("mailto:") ? undefined : "_blank",
                              rel: item.href.startsWith("mailto:") ? undefined : "noopener noreferrer",
                              ...(item.href.startsWith("http")
                                ? { "aria-label": `${item.label} (opens in a new tab)` }
                                : {}),
                            }
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
                  render={
                    <a
                      href={URLS.waitlist}
                      aria-label="Join the AgentCash waitlist by email"
                      onClick={() => setMenuOpen(false)}
                    />
                  }
                  nativeButton={false}
                >
                  Join waitlist
                </Button>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
