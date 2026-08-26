"use client";

import Link from "next/link";
import { loadPreferences } from "@/lib/feed/preferences";
import { useEffect, useState } from "react";

/** Simple placeholder page for the personalized feed */
export default function FeedPage() {
  const [topInterests, setTopInterests] = useState<string[]>([]);

  useEffect(() => {
    const stored = loadPreferences();
    const sorted = [...(stored.interests ?? [])].sort((a, b) => b.strength - a.strength);
    setTopInterests(sorted.slice(0, 3).map(i => i.name));
  }, []);

  return (
    <section className="min-h-screen bg-black/30 text-white py-12">
      <div className="mx-auto max-w-4xl px-6 space-y-8">
        <h1 className="text-4xl font-medium">Your feed is ready.</h1>
        <p className="text-gray-300">
          FeedSmith has built your signal based on your selections.
        </p>
        {topInterests.length > 0 && (
          <p className="text-gray-200">
            Top interests: {topInterests.join(", ")}
          </p>
        )}
        <p className="text-gray-400 italic">Personalized content will appear here.</p>
        <Link href="/" className="inline-block px-4 py-2 rounded bg-violet-500 hover:bg-violet-600 transition text-white">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
