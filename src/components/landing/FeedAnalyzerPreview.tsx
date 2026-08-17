"use client";

import { motion } from "framer-motion";

export default function FeedAnalyzerPreview() {
  return (
    <section id="feed-analyzer" className="py-24 bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-0">
        <h2 className="mb-12 text-4xl font-bold text-center">See what your algorithm actually thinks about you.</h2>
        <div className="rounded-xl bg-black/40 p-6 backdrop-blur">
          <pre className="whitespace-pre-wrap text-sm text-gray-300">YOUR CURRENT FEED
Technology       45%
Entertainment    25%
Gaming           15%
Sports           10%
Other             5%

━━━━━━━━━━━━━━━━━━━━━━

Feed Alignment

64%

Your feed is improving.

↑ Technology
↑ Programming

↓ Entertainment
↓ Random content</pre>
        </div>
      </div>
    </section>
  );
}
