"use client";

import { motion } from "framer-motion";

// Simple mock‑up UI that uses blurred cards and subtle glows.
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.2, duration: 0.5, type: "spring", stiffness: 80 },
  }),
};

export default function HeroVisual() {
  return (
    <div className="relative inset-0 flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-600/10 via-transparent to-transparent" />

      <motion.div
        className="grid grid-cols-2 gap-4 p-8"
        initial="hidden"
        animate="visible"
        variants={{}}
      >
        {/* Preference cards */}
        {[
          { title: "AI", pct: 35 },
          { title: "Programming", pct: 30 },
          { title: "Cybersecurity", pct: 20 },
          { title: "Cats", pct: 15 },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            custom={idx}
            variants={cardVariants}
            className="relative rounded-xl bg-black/40 p-4 text-sm backdrop-blur-sm"
          >
            <div className="text-indigo-300">{item.title}</div>
            <div className="mt-1 text-white/80">{item.pct}%</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
