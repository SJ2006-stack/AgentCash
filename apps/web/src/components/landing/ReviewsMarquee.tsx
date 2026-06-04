"use client";

import Image from "next/image";

import { Marquee } from "@/components/magicui/marquee";
import { reviews, reviewsSection } from "@/content/landing";
import { useMotionEnabled, useMotionReady } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FIRST_ROW = reviews.slice(0, 4);
const SECOND_ROW = reviews.slice(4, 8);

function ReviewCard({
  name,
  username,
  body,
  role,
  motionOn,
}: (typeof reviews)[number] & { motionOn: boolean }) {
  return (
    <figure
      className={cn(
        "ac-card relative w-64 shrink-0 cursor-default border-[var(--ac-surface-glass-border)] bg-[var(--ac-surface-glass)] p-4 sm:w-72",
        "ring-1 ring-emerald-400/10 transition-[transform,box-shadow,ring-color] duration-200",
        motionOn &&
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
  const ready = useMotionReady();
  const motionOn = useMotionEnabled();

  return (
    <div className="mt-12 w-full max-w-5xl sm:mt-14">
      <p className="ac-eyebrow mb-4 text-center text-emerald-400/80">{reviewsSection.eyebrow}</p>
      <div className="relative w-full overflow-hidden" aria-label={reviewsSection.ariaLabel}>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[18%] bg-gradient-to-r from-[var(--ac-bg)] from-25% via-[var(--ac-bg)]/70 via-55% to-transparent sm:w-1/4"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[18%] bg-gradient-to-l from-[var(--ac-bg)] from-25% via-[var(--ac-bg)]/70 via-55% to-transparent sm:w-1/4"
          aria-hidden
        />

        <div
          data-motion={ready && motionOn ? "on" : "off"}
          className={cn(
            "flex w-full flex-col gap-3 [--gap:1rem] sm:gap-4",
            "[&_.animate-marquee]:![animation-play-state:paused]",
            "data-[motion=on]:[&_.animate-marquee]:![animation-play-state:running]",
          )}
        >
          <Marquee pauseOnHover repeat={2} className="[--duration:42s] [--gap:1rem]">
            {FIRST_ROW.map((review) => (
              <ReviewCard key={review.username} motionOn={motionOn} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover repeat={2} className="[--duration:48s] [--gap:1rem]">
            {SECOND_ROW.map((review) => (
              <ReviewCard key={`${review.username}-row2`} motionOn={motionOn} {...review} />
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
