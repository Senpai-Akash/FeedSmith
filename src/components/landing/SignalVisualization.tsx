"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

/**
 * A lightweight, editorial‑style visualization that shows content signals
 * (interest categories) converging toward a central feed‑profile node.
 *
 * The component is deliberately simple – it uses a small set of hard‑coded
 * tags that animate from the edges toward the centre. The animation is
 * triggered on mount and loops subtly so the visual feels alive without
 * distracting the user.
 */
const signals = [
  { label: "AI", color: "#ff6b6b" },
  { label: "Programming", color: "#ffa502" },
  { label: "Cybersecurity", color: "#1dd1a1" },
  { label: "Cats", color: "#f368e0" },
  { label: "Gaming", color: "#54a0ff", omit: true }, // negative example
  { label: "Politics", color: "#576574", omit: true },
];

export default function SignalVisualization() {
  const controls = useAnimation();

  useEffect(() => {
    // Phase 1 – signals appear from random corners
    controls.start((i: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: { delay: i * 0.15, type: "spring", stiffness: 120 },
    }));
  }, [controls]);

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const item = (i: number) => ({
    hidden: {
      opacity: 0,
      x: i % 2 === 0 ? -120 : 120,
      y: i % 3 === 0 ? -80 : 80,
    },
    visible: { opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 150 } },
  });

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Central node – the resulting feed profile */}
      <motion.div
        className="z-10 flex size-20 items-center justify-center rounded-full bg-accent text-sm font-medium text-white shadow-lg"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        Feed Profile
      </motion.div>

      {/* Signals around the perimeter */}
      {signals.map((s, i) => (
        <motion.div
          key={s.label}
          custom={i}
          variants={item(i)}
          className="absolute rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: s.color, opacity: s.omit ? 0.4 : 0.85 }}
        >
          {s.label}
        </motion.div>
      ))}
    </motion.div>
  );
}
