"use client";

/** Shared Framer Motion presets — keep in sync with design-tokens.css */

/**
 * Hydration-safe motion gating (use in client components):
 * - `useMotionReady()` — false during SSR and the first client render; static HTML stays visible.
 * - `useMotionEnabled()` — true after ready when reduced motion is off.
 * Until enabled, render static children (no hidden opacity). After ready, mount motion and drive via controls.
 */

import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type RefObject } from "react";

/** True after the client has committed post-hydration (false on SSR and first client render). */
export function useMotionReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}

/** @deprecated Alias for `useMotionReady`. */
export function useHasMounted(): boolean {
  return useMotionReady();
}

function useMediaReducedMotion(): boolean {
  const [prefersReduce, setPrefersReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return prefersReduce;
}

/** True when the user prefers reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const ready = useMotionReady();
  const mediaReduce = useMediaReducedMotion();
  const framerReduce = useReducedMotion();
  if (!ready) return false;
  return mediaReduce || framerReduce === true;
}

/** True after ready when Framer viewport/entrance animations should run. */
export function useMotionEnabled(): boolean {
  const ready = useMotionReady();
  const mediaReduce = useMediaReducedMotion();
  const framerReduce = useReducedMotion();
  if (!ready) return false;
  return !mediaReduce && framerReduce !== true;
}

/** @deprecated Alias for `useMotionEnabled`. */
export function useAnimateMotion(): boolean {
  return useMotionEnabled();
}

/** Default viewport for scroll reveals. */
export const motionViewport = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -8% 0px",
} as const;

type RevealInViewOptions = {
  once?: boolean;
  amount?: number;
  margin?: string;
};

/** Native intersection observer for scroll reveals (pairs with CSS entrance classes). */
export function useRevealInView(
  ref: RefObject<Element | null>,
  options: RevealInViewOptions = motionViewport,
  enabled = true,
): boolean {
  const { once = true, amount = 0.12, margin = "0px 0px -8% 0px" } = options;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setInView(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let done = false;
    let observer: IntersectionObserver | null = null;

    const scrollOpts: AddEventListenerOptions = { passive: true };

    const markInView = () => {
      if (done) return;
      setInView(true);
      if (once) {
        done = true;
        observer?.disconnect();
        window.removeEventListener("scroll", onScroll, scrollOpts);
        window.removeEventListener("resize", onScroll);
      }
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markInView();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount, rootMargin: margin },
    );

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      if (rect.height > 0 && visible / rect.height >= amount) {
        markInView();
      }
    };

    observer.observe(el);
    onScroll();
    window.addEventListener("scroll", onScroll, scrollOpts);
    window.addEventListener("resize", onScroll);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll, scrollOpts);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, enabled, once, amount, margin]);

  return inView;
}

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const motionDurations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  reveal: 0.6,
} as const;

export const revealTransition = {
  duration: motionDurations.slow,
  ease: easeOut,
} as const;

export const staggerChildren = 0.06;

export const springSnappy = { type: "spring" as const, stiffness: 420, damping: 28 };
