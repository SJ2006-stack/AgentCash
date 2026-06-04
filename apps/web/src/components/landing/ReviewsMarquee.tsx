"use client";

import Image from "next/image";

import { Marquee } from "@/components/magicui/marquee";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const REVIEWS = [
  {
    name: "Maya Chen",
    username: "mayac",
    body: "Our agents settle x402 merchants in USDC—no more pre-funding a dozen API dashboards.",
    role: "Founder, Lattice Agents",
  },
  {
    name: "Jordan Okonkwo",
    username: "jokonkwo",
    body: "agentcash quote + run turned our registry into one budgeted workflow the team actually trusts.",
    role: "Staff engineer, Orbit Ops",
  },
  {
    name: "Sam Rivera",
    username: "samr",
    body: "BYOK wallet at ~/.agentcash means we own keys and Base settlement without a hosted custodian.",
    role: "Infra lead, Synthwave AI",
  },
  {
    name: "Priya Nair",
    username: "priyan",
    body: "Sub-cent micro-payments per tool call—our bot fleet stopped hoarding giant prepaid credits.",
    role: "CTO, Parcelmind",
  },
  {
    name: "Alex Kim",
    username: "alexk",
    body: "Task router v0 paid each registry slug sequentially; receipts on disk are our audit trail.",
    role: "Platform, Driftstack",
  },
  {
    name: "Taylor Brooks",
    username: "tbrooks",
    body: "CLI doctor on testnet caught our facilitator config before we burned mainnet USDC.",
    role: "DevRel, Northline",
  },
  {
    name: "Riley Santos",
    username: "rileys",
    body: "Curated registry.yaml keeps planners on slugs we allow—no surprise paid endpoints in prod.",
    role: "Security, Helix Foundry",
  },
  {
    name: "Morgan Lee",
    username: "morganl",
    body: "Coinbase x402 facilitator plus USDC on Base—agents settle while we sleep.",
    role: "CEO, Autonode Labs",
  },
] as const;

const FIRST_ROW = REVIEWS.slice(0, 4);
const SECOND_ROW = REVIEWS.slice(4, 8);

function ReviewCard({
  name,
  username,
  body,
  role,
  reduceMotion,
}: (typeof REVIEWS)[number] & { reduceMotion: boolean }) {
  return (
    <figure
      className={cn(
        "ac-card relative w-64 shrink-0 cursor-default border-[var(--ac-surface-glass-border)] bg-[var(--ac-surface-glass)] p-4 sm:w-72",
        "ring-1 ring-emerald-400/10 transition-[transform,box-shadow,ring-color] duration-200",
        !reduceMotion &&
          "hover:-translate-y-0.5 hover:ring-emerald-400/30 hover:shadow-[0_12px_32px_-16px_rgba(52,211,153,0.35)]",
      )}
    >
      <blockquote className="line-clamp-4 text-left text-sm leading-relaxed text-[var(--ac-fg-muted)]">
        &ldquo;{body}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-[var(--ac-border)] pt-4">
        <Image
          src={`https://avatar.vercel.sh/${username}`}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full border border-emerald-400/20 bg-[var(--ac-bg-elevated)]"
          unoptimized
        />
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-medium text-[var(--ac-fg)]">{name}</p>
          <p className="truncate text-xs text-emerald-400/80">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function ReviewsMarquee() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className="mt-12 w-full max-w-5xl sm:mt-14">
      <p className="ac-eyebrow mb-4 text-center text-emerald-400/80">
        Builders shipping with AgentCash
      </p>
      <div
        className="relative w-full overflow-hidden"
        aria-label="What builders are saying about AgentCash"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[18%] bg-gradient-to-r from-[var(--ac-bg)] from-25% via-[var(--ac-bg)]/70 via-55% to-transparent sm:w-1/4"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[18%] bg-gradient-to-l from-[var(--ac-bg)] from-25% via-[var(--ac-bg)]/70 via-55% to-transparent sm:w-1/4"
          aria-hidden
        />

        <div className="flex w-full flex-col gap-3 [--gap:1rem] sm:gap-4">
          <Marquee pauseOnHover repeat={2} className="[--duration:42s] [--gap:1rem]">
            {FIRST_ROW.map((review) => (
              <ReviewCard key={review.username} reduceMotion={reduceMotion} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover repeat={2} className="[--duration:48s] [--gap:1rem]">
            {SECOND_ROW.map((review) => (
              <ReviewCard key={`${review.username}-row2`} reduceMotion={reduceMotion} {...review} />
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
