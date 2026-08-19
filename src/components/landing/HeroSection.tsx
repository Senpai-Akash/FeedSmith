"use client";

import { motion } from "framer-motion";
import AlgorithmWaveBackground from "./AlgorithmWaveBackground";

export default function HeroSection() {
  return (
    <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Background animation */}
      <div className="absolute inset-0 pointer-events-none">
        <AlgorithmWaveBackground />
      </div>
      {/* Content overlay */}
      <div className="relative max-w-2xl text-center px-4 py-24 md:py-32 lg:py-40">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >Your feed should know what you want.</motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >Make the algorithm visible – shape your social media recommendations with intent.</motion.p>
        <motion.a
          href="#"
          className="inline-block bg-accent text-white px-6 py-3 rounded-md font-medium hover:bg-accent/90 transition"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >Get Started</motion.a>
      </div>
    </section>
  );
}
