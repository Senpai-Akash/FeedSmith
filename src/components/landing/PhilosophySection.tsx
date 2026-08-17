"use client";

import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

export default function PhilosophySection() {
  return (
    <section id="philosophy" className="py-32 bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto text-center px-6">
        <motion.h2
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-6 text-5xl font-extrabold"
        >Your attention is yours.</motion.h2>
         <motion.p
           variants={fade}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.3 }}
           className="text-lg text-gray-300"
         >Recommendation algorithms are designed to learn what keeps you watching. FeedSmith helps you become intentional about what you teach them.</motion.p>
      </div>
    </section>
  );
}
