"use client";

import { motion } from "framer-motion";

/**
 * Three‑statement feature block replacing a generic grid.
 */
export default function FeatureSection() {
  const items = [
    { id: 1, title: "START WITH INTENTION", description: "Define what you actually want to see." },
    { id: 2, title: "UNDERSTAND YOUR SIGNALS", description: "See how each interest shapes the algorithm." },
    { id: 3, title: "SHAPE YOUR FEED", description: "Iteratively adjust and track alignment." },
  ];

  return (
    <section id="features" className="py-24 bg-gray-950 text-gray-100"
      >
      <div className="container mx-auto px-6 lg:px-12">
        <motion.h2
          className="mb-16 text-center text-4xl font-bold text-accent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true, amount: 0.2 }}
        >
          Why FeedSmith
        </motion.h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className="relative p-6 text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.2 } }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="mb-4 text-6xl font-extrabold text-gray-700">0{item.id}</div>
              <h3 className="mb-3 text-2xl font-semibold text-accent">{item.title}</h3>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
