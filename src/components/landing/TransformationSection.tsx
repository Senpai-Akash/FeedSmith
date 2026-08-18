"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll‑linked transformation visualising the journey from a random feed
 * to an intentional one.
 */
export default function TransformationSection() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const y = useTransform(scrollYProgress, [0.2, 0.8], [100, -100]);

  return (
    <section id="transformation" className="relative py-32 bg-gray-950 text-gray-100">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.h2
          className="mb-12 text-center text-4xl font-bold text-accent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true, amount: 0.2 }}
        >
          The Transformation
        </motion.h2>

        <motion.div
          className="relative flex h-96 items-center justify-center overflow-hidden"
          style={{ opacity, y }}
        >
          {/* Random feed – scattered tags */}
          {["Gaming", "Politics", "Sports", "Celebrity", "Entertainment"].map((tag, i) => (
            <motion.span
              key={tag}
              className="absolute rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-500"
              style={{
                top: `${20 + i * 10}%`,
                left: `${10 + i * 15}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.4 } }}
            >{tag}</motion.span>
          ))}

          {/* Arrow indicating conversion */}
          <motion.div
            className="absolute text-4xl text-accent"
            animate={{ rotate: [0, 15, -15, 0], transition: { repeat: Infinity, duration: 6 } }}
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          >↔</motion.div>

          {/* Desired feed – centered, ordered tags */}
          {["AI", "Programming", "Cybersecurity", "Cats"].map((tag, i) => (
            <motion.span
              key={tag}
              className="absolute rounded-full bg-accent px-3 py-1 text-sm font-medium text-white"
              style={{
                top: `${50 + i * 5}%`,
                left: `${50}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 1 + i * 0.2, duration: 0.4 } }}
            >{tag}</motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
