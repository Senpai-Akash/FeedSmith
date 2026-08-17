"use client";

import { motion } from "framer-motion";

const barVariants = {
  hidden: { width: 0 },
  visible: (pct: number) => ({
    width: `${pct}%`,
    transition: { duration: 0.8, ease: "easeOut" },
  }),
};

export default function FeedProfilePreview() {
  const interests = [
    { name: "Artificial Intelligence", pct: 35 },
    { name: "Programming", pct: 30 },
    { name: "Cybersecurity", pct: 20 },
    { name: "Cats", pct: 15 },
  ];
  const styles = [
    { name: "Educational", pct: 70 },
    { name: "Entertainment", pct: 20 },
    { name: "Humor", pct: 10 },
  ];
  const avoid = ["Celebrity", "Politics", "Sports"];

  return (
    <section id="profile-preview" className="py-24 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-0">
        <h2 className="mb-12 text-4xl font-bold text-center">Your Feed Profile</h2>
        {/* Interests */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-indigo-300">INTERESTS</h3>
          {interests.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4"
            >
              <span className="w-32 text-sm text-gray-400">{item.name}</span>
              <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  custom={item.pct}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={barVariants}
                ></motion.div>
              </div>
              <span className="w-12 text-sm text-gray-200">{item.pct}%</span>
            </motion.div>
          ))}
        </div>

        {/* Content style */}
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-indigo-300">CONTENT STYLE</h3>
          {styles.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4"
            >
              <span className="w-32 text-sm text-gray-400">{item.name}</span>
              <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-400"
                  custom={item.pct}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={barVariants}
                ></motion.div>
              </div>
              <span className="w-12 text-sm text-gray-200">{item.pct}%</span>
            </motion.div>
          ))}
        </div>

        {/* Avoid */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-indigo-300">AVOID</h3>
          <ul className="list-disc list-inside text-gray-300">
            {avoid.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
