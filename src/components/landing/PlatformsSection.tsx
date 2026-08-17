"use client";

import { motion } from "framer-motion";

const platforms = ["Instagram", "YouTube", "TikTok", "Reddit", "X"];

export default function PlatformsSection() {
  return (
     <section id="platforms" className="py-24 bg-gray-950 text-white">
       <div className="max-w-4xl mx-auto text-center px-6">
         <h2 className="mb-8 text-4xl font-bold">One profile. Every feed.</h2>
         <p className="mb-12 text-gray-300">Coming later</p>
         <div className="flex flex-wrap justify-center gap-8">
           {/* Placeholder circles for logos */}
           {platforms.map((p, i) => (
             <motion.div
               key={i}
               className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-gray-200"
               whileHover={{ scale: 1.1, rotate: 5 }}
             >{p}</motion.div>
           ))}
         </div>
       </div>
     </section>
  );
}
