"use client";

import { motion } from "framer-motion";

/**
 * Shows the gap between the desired feed (profile) and the current algorithmic feed.
 */
export default function FeedComparison() {
  const desired = [
    { label: "AI", pct: 35 },
    { label: "Programming", pct: 30 },
    { label: "Cybersecurity", pct: 20 },
    { label: "Cats", pct: 15 },
  ];
  const current = [
    { label: "Entertainment", pct: 35 },
    { label: "Gaming", pct: 25 },
    { label: "Technology", pct: 20 },
    { label: "Sports", pct: 10 },
    { label: "Other", pct: 10 },
  ];

  const bar = (pct: number) => `${pct}%`;

  return (
    <section id="comparison" className="py-24 bg-gray-950 text-gray-100">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.h2
          className="mb-12 text-center text-4xl font-bold text-accent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true, amount: 0.2 }}
        >
          Desired vs Current Feed
        </motion.h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Desired */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-accent">Desired Feed</h3>
            {desired.map((d) => (
              <div key={d.label} className="mb-2 flex items-center">
                <span className="w-24 text-sm font-medium text-gray-300">{d.label}</span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-gray-800" style={{ height: "0.5rem" }}>
                  <div
                    className="absolute inset-y-0 rounded-full bg-accent"
                    style={{ width: bar(d.pct) }}
                  />
                </div>
                <span className="ml-2 w-12 text-sm font-medium text-gray-200">{d.pct}%</span>
              </div>
            ))}
          </div>

          {/* Current */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-accent">Current Feed</h3>
            {current.map((c) => (
              <div key={c.label} className="mb-2 flex items-center">
                <span className="w-32 text-sm font-medium text-gray-500">{c.label}</span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-gray-800" style={{ height: "0.5rem" }}>
                  <div
                    className="absolute inset-y-0 rounded-full bg-gray-500"
                    style={{ width: bar(c.pct) }}
                  />
                </div>
                <span className="ml-2 w-12 text-sm font-medium text-gray-400">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alignment score */}
        <motion.div
          className="mt-12 text-center text-5xl font-bold text-accent"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.6 } }}
          viewport={{ once: true, amount: 0.2 }}
        >
          64% FEED ALIGNMENT
        </motion.div>
      </div>
    </section>
  );
}
