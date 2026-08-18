"use client";

import { motion } from "framer-motion";

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};

const steps = [
  {
    title: "01 — Tell us what you love",
    desc: "Choose your interests, content styles and preferences.",
  },
  {
    title: "02 — Build your Feed Profile",
    desc: "FeedSmith converts your preferences into a structured profile.",
  },
  {
    title: "03 — Get your strategy",
    desc: "Our AI generates a personalized training strategy.",
  },
  {
    title: "04 — Watch your feed evolve",
    desc: "Track your progress and refine the strategy.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-0">
        <h2 className="mb-12 text-4xl font-bold text-center">How FeedSmith Works</h2>
        <div className="grid gap-12 md:grid-cols-2">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stepVariants}
              className="rounded-xl bg-black/30 p-6 backdrop-blur"
            >
               <h3 className="mb-2 text-xl font-semibold text-accent">{step.title}</h3>
              <p className="text-gray-300">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
