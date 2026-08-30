"use client";

import Link from "next/link";
import { loadPreferences } from "@/lib/feed/preferences";
import { recommendFeed } from "@/lib/feed/recommendation";
import { MOCK_CONTENT } from "@/lib/feed/mockContent";
import { ScoreBadge } from "@/app/feed/ScoreBadge";
import { WhyThisPanel } from "@/app/feed/WhyThisPanel";
import { useEffect, useState } from "react";
import { FeedPreferences } from "@/lib/feed/types";

/**
 * Full featured feed page – shows a ranked list of recommended items
 * together with an explanation of why each item matched the user's signal.
 */
export default function FeedPage() {
  const [preferences, setPreferences] = useState<FeedPreferences | null>(null);
  const [items, setItems] = useState([] as any[]);

  // Load preferences once on client mount.
  useEffect(() => {
    const prefs = loadPreferences();
    setPreferences(prefs);
    // If there are no interests, we keep items empty – UI will show empty state.
    if (prefs.interests?.length) {
      const rec = recommendFeed(prefs, MOCK_CONTENT);
      setItems(rec);
    }
  }, []);

  const hasSignal = preferences && preferences.interests && preferences.interests.length > 0;

  return (
    <section className="min-h-screen bg-black/30 text-white py-12">
      <div className="mx-auto max-w-5xl px-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-medium">Your Feed</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                // Simple refresh – re‑run recommendation on the same mock data.
                if (preferences) setItems(recommendFeed(preferences, MOCK_CONTENT));
              }}
              className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            >
              Refresh ↻
            </button>
            <Link href="/build" className="text-sm underline hover:text-gray-200">
              ← Adjust signal
            </Link>
          </div>
        </header>

        {/* Empty state when no preferences are set */}
        {!hasSignal && (
          <div className="pt-12 text-center">
            <p className="text-lg text-gray-300">
              You haven’t set any interests yet. Head over to the build page to customise your signal.
            </p>
            <Link
              href="/build"
              className="mt-4 inline-block rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-500"
            >
              Go to Build
            </Link>
          </div>
        )}

        {/* Render the ranked feed */}
        {hasSignal && items.length > 0 && (
          <ul className="space-y-6">
            {items.map((item, idx) => (
              <li
                key={item.content.id}
                className={idx === 0 ? "border-b border-white/20 pb-6" : "border-b border-white/10 pb-4"}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {item.content.image && (
                    <img
                      src={item.content.image}
                      alt={item.content.title}
                      className={idx === 0 ? "w-32 h-auto object-cover rounded" : "w-32 h-auto object-cover rounded"}
                    />
                  )}
                  <div className="flex">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">
                        {item.content.title}
                      </h2>
                      <ScoreBadge score={item.score} />
                    </div>
                    <p className="mt-1 text-sm text-gray-200 line-clamp-3">
                      {item.content.description}
                    </p>
                    {item.content.source && (
                      <p className="mt-1 text-xs text-gray-400">Source: {item.content.source}</p>
                    )}
                    <WhyThisPanel reasons={item.reasons} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
