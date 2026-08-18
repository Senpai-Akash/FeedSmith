"use client";

import { motion } from "framer-motion";

/**
 * Visual representation of the final feed profile.
 * Uses a radial composition with percentage labels.
 */
export default function FeedProfile() {
  const data = [
    { label: "AI", pct: 35, color: "#ff6b6b" },
    { label: "Programming", pct: 30, color: "#ffa502" },
    { label: "Cybersecurity", pct: 20, color: "#1dd1a1" },
    { label: "Cats", pct: 15, color: "#f368e0" },
  ];

  return (
    <section id="profile" className="relative py-24 bg-gray-900 text-gray-100">
      <div className="container mx-auto px-6 lg:px-12"
        style={{ maxWidth: "800px" }}
      >
        <motion.h2
          className="mb-12 text-center text-4xl font-bold text-accent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true, amount: 0.2 }}
        >
          Your Feed Profile
        </motion.h2>

        <div className="relative flex justify-center">
          {/* Radial rings */}
          {data.map((d, i) => (
            <motion.div
              key={d.label}
              className="absolute flex size-72 items-center justify-center rounded-full border"
              style={{ borderColor: d.color, borderWidth: 2, transform: `rotate(${i * 90}deg)` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1, transition: { duration: 0.5, delay: i * 0.2 } }}
              viewport={{ once: true }}
            >
              <span className="text-xl font-medium text-white">{d.pct}% {d.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
