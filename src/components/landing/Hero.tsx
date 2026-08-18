"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroVisual from "./HeroVisual";
import { fadeUp, fadeIn } from "@/lib/animations";

/**
 * Redesigned Hero that emphasizes typography and the algorithm‑shaping visual.
 * The badge (eyebrow) uses the accent colour. The headline is split for
 * intentional asymmetry and larger line‑height. The CTA buttons are minimal –
 * primary uses the accent background, secondary is a simple underline link.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-gray-100 py-24 md:py-32">
      {/* Eyebrow */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-3 text-sm font-medium uppercase tracking-wider text-accent"
      >
        FeedSmith • Personal Algorithm
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl"
      >
        <span className="block">Your feed should</span>
        <span className="block text-accent">know what you want.</span>
      </motion.h1>

      {/* Sub‑text */}
      <motion.p
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mt-6 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400"
      >
        Shape the content that appears for you. Tell FeedSmith your interests, and we’ll craft the feed you actually want.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Link
          href="#"
          className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent/90 transition"
        >
          Build My Feed →
        </Link>
        <Link
          href="#how-it-works"
          className="text-sm font-medium text-accent underline underline-offset-4 hover:text-accent/80 transition"
        >
          See how it works
        </Link>
      </motion.div>

      {/* Algorithm visual – occupies the full height behind the text */}
      <div className="absolute inset-0 pointer-events-none">
        <HeroVisual />
      </div>
    </section>
  );
}
