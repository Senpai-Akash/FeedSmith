"use client";

import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ProblemSection() {
  return (
    <section id="problem" className="py-24 px-6 lg:px-24 bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-3xl font-bold text-center"
        >Your feed shouldn't take weeks to understand you.</motion.h2>

        {/* Comparison layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2" >
          {/* Traditional */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-xl bg-black/40 p-6 backdrop-blur"
          >
             <h3 className="text-center mb-4 text-xl font-semibold text-accent">Traditional</h3>
            <pre className="text-center whitespace-pre-wrap text-sm text-gray-300">Create account<br/>
   ↓<br/>
Random content<br/>
   ↓<br/>
Like / Skip<br/>
   ↓<br/>
Follow random creators<br/>
   ↓<br/>
Wait…<br/>
   ↓<br/>
Still irrelevant content</pre>
          </motion.div>

          {/* FeedSmith */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-xl bg-black/40 p-6 backdrop-blur"
          >
             <h3 className="text-center mb-4 text-xl font-semibold text-accent">FeedSmith</h3>
            <pre className="text-center whitespace-pre-wrap text-sm text-gray-300">Tell us what you want<br/>
   ↓<br/>
Build your profile<br/>
   ↓<br/>
Get your strategy<br/>
   ↓<br/>
Train intentionally<br/>
   ↓<br/>
Track progress</pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
