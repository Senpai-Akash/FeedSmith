"use client";

import { motion } from "framer-motion";

/**
 * Interactive‑looking preview of the FeedSmith product UI.
 * It does not contain real functionality – the goal is visual storytelling.
 */
export default function FeedBuilderPreview() {
  return (
    <section id="product" className="relative py-24 bg-gray-950 text-gray-100">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.h2
          className="mb-12 text-4xl font-bold text-center text-accent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true, amount: 0.2 }}
        >
          Build Your Feed
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          {/* Left – selection UI */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Include</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {"AI Programming Cybersecurity Cats".split(" ").map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Exclude</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {"Celebrity Politics Sports".split(" ").map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right – mock preview of the resulting feed */}
          <div className="relative rounded-xl bg-gray-900 p-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <span className="text-sm font-medium text-gray-400">Your Feed Profile</span>
              <span className="text-sm font-medium text-accent">35% AI</span>
            </div>
            {/* Simulated content cards */}
            <div className="mt-4 grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
