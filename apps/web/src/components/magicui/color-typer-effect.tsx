"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Emerald → teal → cyan (AgentCash accent gradient) */
const GRADIENT_RGB: readonly [number, number, number][] = [
  [110, 231, 183],
  [94, 234, 212],
  [103, 232, 249],
] as const;

const DEFAULT_APPEAR_COLOR = "#34d399";

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function gradientColorAt(index: number, total: number): string {
  if (total <= 1) {
    const [r, g, b] = GRADIENT_RGB[0];
    return `rgb(${r}, ${g}, ${b})`;
  }
  const t = index / (total - 1);
  const scaled = t * (GRADIENT_RGB.length - 1);
  const seg = Math.min(Math.floor(scaled), GRADIENT_RGB.length - 2);
  const local = scaled - seg;
  const [r0, g0, b0] = GRADIENT_RGB[seg];
  const [r1, g1, b1] = GRADIENT_RGB[seg + 1];
  return `rgb(${lerpChannel(r0, r1, local)}, ${lerpChannel(g0, g1, local)}, ${lerpChannel(b0, b1, local)})`;
}

type ColorTyperTag = "h1" | "h2" | "h3" | "p" | "span";

export type ColorTyperMode = "appear" | "rotate";
export type ColorTyperSplit = "chars" | "words";
export type ColorTyperDirection = "left-to-right" | "right-to-left";

export interface ColorTyperEffectProps {
  /** Static copy — Framer-style color wave (`appear` mode). */
  text?: string;
  /** Rotating typewriter phrases (`rotate` mode). */
  words?: string[];
  mode?: ColorTyperMode;
  className?: string;
  appearColor?: string;
  /** When set, all units settle to this color; otherwise per-unit gradient. */
  finalColor?: string;
  splitType?: ColorTyperSplit;
  direction?: ColorTyperDirection;
  /** Seconds (Framer defaults: delay 0.2, colorDelay 0.3, stagger 0.1). */
  delay?: number;
  colorDelay?: number;
  stagger?: number;
  typingSpeed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
  as?: ColorTyperTag;
  showCursor?: boolean;
}

function resolveFinalColor(
  index: number,
  total: number,
  finalColor: string | undefined,
): string {
  return finalColor ?? gradientColorAt(index, total);
}

function ColorRevealUnit({
  content,
  index,
  total,
  orderIndex,
  appearColor,
  finalColor,
  delaySec,
  colorDelaySec,
  staggerSec,
  animate,
}: {
  content: string;
  index: number;
  total: number;
  orderIndex: number;
  appearColor: string;
  finalColor: string;
  delaySec: number;
  colorDelaySec: number;
  staggerSec: number;
  animate: boolean;
}) {
  const display = content === " " ? "\u00A0" : content;
  const baseDelay = orderIndex * staggerSec + delaySec;
  const settleAt = baseDelay + colorDelaySec;

  if (!animate) {
    return (
      <span className="inline-block" style={{ color: finalColor }}>
        {display}
      </span>
    );
  }

  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, color: appearColor }}
      animate={{ opacity: 1, color: finalColor }}
      transition={{
        opacity: { duration: 0, delay: baseDelay },
        color: { duration: 0, delay: settleAt },
      }}
      style={{ color: finalColor }}
    >
      {display}
    </motion.span>
  );
}

function splitForAppear(text: string, splitType: ColorTyperSplit): string[] {
  if (splitType === "words") {
    return text.split(/(\s+)/).filter((part) => part.length > 0);
  }
  return [...text];
}

function AppearColorTyper({
  text,
  className,
  appearColor,
  finalColor: finalColorProp,
  splitType,
  direction,
  delay,
  colorDelay,
  stagger,
  as: Tag,
}: {
  text: string;
  className?: string;
  appearColor: string;
  finalColor?: string;
  splitType: ColorTyperSplit;
  direction: ColorTyperDirection;
  delay: number;
  colorDelay: number;
  stagger: number;
  as: ColorTyperTag;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const units = useMemo(() => splitForAppear(text, splitType), [text, splitType]);
  const total = units.length;

  return (
    <Tag
      className={cn("inline-flex flex-wrap justify-center", className)}
      aria-label={text}
    >
      {units.map((unit, index) => {
        const orderIndex =
          direction === "left-to-right" ? index : total - 1 - index;
        const resolvedFinal = resolveFinalColor(index, total, finalColorProp);
        return (
          <ColorRevealUnit
            key={`${unit}-${index}`}
            content={unit}
            index={index}
            total={total}
            orderIndex={orderIndex}
            appearColor={appearColor}
            finalColor={resolvedFinal}
            delaySec={delay}
            colorDelaySec={colorDelay}
            staggerSec={stagger}
            animate={!reduceMotion}
          />
        );
      })}
    </Tag>
  );
}

function RotateColorTyper({
  words,
  className,
  appearColor,
  finalColor: finalColorProp,
  typingSpeed,
  deleteSpeed,
  pauseMs,
  as: Tag,
  showCursor,
}: {
  words: string[];
  className?: string;
  appearColor: string;
  finalColor?: string;
  typingSpeed: number;
  deleteSpeed: number;
  pauseMs: number;
  as: ColorTyperTag;
  showCursor: boolean;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const safeWords = useMemo(() => words.filter((w) => w.length > 0), [words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const prevLengthRef = useRef(0);

  const currentWord = safeWords[wordIndex % safeWords.length] ?? "";

  useEffect(() => {
    if (reduceMotion || !currentWord) return;

    if (!isDeleting && text === currentWord) {
      const pauseId = window.setTimeout(() => setIsDeleting(true), pauseMs);
      return () => window.clearTimeout(pauseId);
    }

    const delay = isDeleting ? deleteSpeed : typingSpeed;
    const id = window.setTimeout(() => {
      if (isDeleting) {
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((i) => (i + 1) % safeWords.length);
          return;
        }
        setText(currentWord.slice(0, text.length - 1));
        return;
      }

      if (text.length < currentWord.length) {
        setText(currentWord.slice(0, text.length + 1));
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [
    text,
    isDeleting,
    currentWord,
    reduceMotion,
    typingSpeed,
    deleteSpeed,
    pauseMs,
    safeWords.length,
  ]);

  const staticWord = safeWords[0] ?? "";
  const chars = reduceMotion ? staticWord.split("") : text.split("");
  const total = Math.max(chars.length, 1);
  const newlyTypedIndex =
    !isDeleting && chars.length > prevLengthRef.current
      ? chars.length - 1
      : -1;

  useEffect(() => {
    prevLengthRef.current = chars.length;
  }, [chars.length]);

  if (safeWords.length === 0) {
    return null;
  }

  if (reduceMotion) {
    return (
      <Tag className={cn(className)} aria-label={staticWord}>
        {chars.map((char, index) => (
          <ColorRevealUnit
            key={`${char}-${index}`}
            content={char}
            index={index}
            total={total}
            orderIndex={index}
            appearColor={appearColor}
            finalColor={resolveFinalColor(index, total, finalColorProp)}
            delaySec={0}
            colorDelaySec={0.3}
            staggerSec={0}
            animate={false}
          />
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn("inline-flex flex-wrap justify-center", className)}
      aria-live="polite"
      aria-label={text || currentWord}
    >
      {chars.map((char, index) => (
        <ColorRevealUnit
          key={`${wordIndex}-${index}-${char}`}
          content={char}
          index={index}
          total={total}
          orderIndex={index}
          appearColor={appearColor}
          finalColor={resolveFinalColor(index, total, finalColorProp)}
          delaySec={0.2}
          colorDelaySec={0.3}
          staggerSec={0}
          animate={index === newlyTypedIndex}
        />
      ))}
      {showCursor ? (
        <motion.span
          className="ml-1 inline-block h-[0.82em] w-[2px] shrink-0 translate-y-[0.07em] rounded-full bg-gradient-to-b from-emerald-300 to-cyan-300"
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      ) : null}
    </Tag>
  );
}

export function ColorTyperEffect({
  text,
  words,
  mode,
  className,
  appearColor = DEFAULT_APPEAR_COLOR,
  finalColor,
  splitType = "chars",
  direction = "left-to-right",
  delay = 0.2,
  colorDelay = 0.3,
  stagger = 0.1,
  typingSpeed = 85,
  deleteSpeed = 45,
  pauseMs = 2200,
  as: Tag = "h1",
  showCursor = true,
}: ColorTyperEffectProps) {
  const resolvedMode: ColorTyperMode =
    mode ?? (text != null && text.length > 0 ? "appear" : "rotate");

  if (resolvedMode === "appear") {
    const copy = text ?? words?.[0] ?? "";
    if (!copy) return null;
    return (
      <AppearColorTyper
        text={copy}
        className={className}
        appearColor={appearColor}
        finalColor={finalColor}
        splitType={splitType}
        direction={direction}
        delay={delay}
        colorDelay={colorDelay}
        stagger={stagger}
        as={Tag}
      />
    );
  }

  const rotateWords = words ?? (text ? [text] : []);
  return (
    <RotateColorTyper
      words={rotateWords}
      className={className}
      appearColor={appearColor}
      finalColor={finalColor}
      typingSpeed={typingSpeed}
      deleteSpeed={deleteSpeed}
      pauseMs={pauseMs}
      as={Tag}
      showCursor={showCursor}
    />
  );
}
