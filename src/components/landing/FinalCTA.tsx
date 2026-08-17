"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FinalCTA() {
  return (
    <section id="final-cta" className="relative py-32 bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-600/10 via-transparent to-transparent" />
      </div>
      <div className="relative max-w-3xl mx-auto text-center px-6">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6 text-5xl font-bold"
        >
          Your feed. Your rules.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8 text-lg text-gray-300"
        >
          Start building the feed you actually want.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link
            href="#"
            className="inline-block rounded-full bg-indigo-600 px-8 py-3 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Build My Feed →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
