"use client";

import { motion } from "framer-motion";

import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { easeOut, motionDurations, usePrefersReducedMotion } from "@/lib/motion";

export function MarqueeReveal() {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <ReviewsMarquee />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: motionDurations.slow, ease: easeOut }}
    >
      <ReviewsMarquee />
    </motion.div>
  );
}
