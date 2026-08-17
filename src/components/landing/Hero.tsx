"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroVisual from "./HeroVisual";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-24 pb-32 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Badge */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-4 rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-300"
      >
        ✦ Personalize your algorithm
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-2xl text-center text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
      >
        Craft the <span className="text-indigo-400">feed</span> you actually want.
      </motion.h1>

      {/* Sub‑text */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 max-w-xl text-center text-lg text-gray-300 md:mt-8"
      >
        Stop spending days training your social‑media recommendations. Tell FeedSmith what you want to see, and we’ll create a personalized strategy to help shape your feed.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8 flex flex-col gap-4 sm:flex-row"
      >
        <Link
          href="#"
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition"
        >
          Build My Feed →
        </Link>
        <Link
          href="#how-it-works"
          className="rounded-full border border-indigo-400 px-6 py-3 text-sm font-medium text-indigo-300 hover:border-indigo-300 hover:text-white transition"
        >
          See how it works
        </Link>
      </motion.div>

      {/* Visual mockup */}
      <div className="absolute inset-0 pointer-events-none">
        <HeroVisual />
      </div>
    </section>
  );
}
