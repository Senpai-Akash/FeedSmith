"use client";

import { motion } from "framer-motion";

export default function FeedAnalyzerPreview() {
  return (
    <section id="feed-analyzer" className="py-24 bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-0">
        <h2 className="mb-12 text-4xl font-bold text-center">See what your algorithm actually thinks about you.</h2>
        <div className="rounded-xl bg-black/40 p-6 backdrop-blur">
          <pre className="text-center whitespace-pre-wrap text-sm text-gray-300">YOUR CURRENT FEED
<br/>Technology       45%<br/>
Entertainment    25%<br/>
Gaming           15%<br/>
Sports           10%<br/>
Other             5%<br/>

━━━━━━━━━━━━━━━━━━━━━━
<br/>

Feed Alignment

64%
<br/>
<br/>
Your feed is improving.
<br/>
↑ Technology
↑ Programming

↓ Entertainment
↓ Random content</pre>
        </div>
      </div>
    </section>
  );
}
