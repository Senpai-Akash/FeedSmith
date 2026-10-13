"use client";

import Link from "next/link";
import Image from "next/image";
import { loadPreferences } from "@/lib/feed/preferences";
import { recommendFeed } from "@/lib/feed/recommendation";
import { MOCK_CONTENT } from "@/lib/feed/mockContent";
import { ScoreBadge } from "@/app/feed/ScoreBadge";
import { WhyThisPanel } from "@/app/feed/WhyThisPanel";
import { useEffect, useState } from "react";
import { FeedPreferences } from "@/lib/feed/types";
import { RecommendedItem } from "@/lib/feed/content";

/**
 * Full featured feed page – shows a ranked list of recommended items
 * together with an explanation of why each item matched the user's signal.
 */
export default function FeedPage() {
  const [preferences, setPreferences] = useState<FeedPreferences | null>(null);
  const [items, setItems] = useState<RecommendedItem[]>([]);

  // Load preferences once on client mount.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const prefs = loadPreferences();
      setPreferences(prefs);
      // If there are no interests, we keep items empty – UI will show empty state.
      if (prefs.interests?.length) {
        const rec = recommendFeed(prefs, MOCK_CONTENT);
        setItems(rec);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const hasSignal = preferences && preferences.interests && preferences.interests.length > 0;

  return (
    <section className="min-h-screen bg-[#070709] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c0817]/75 p-5 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                Algorithm Sandbox
              </span>
              <span className="text-xs text-white/50">Live Output Simulation</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Trained Feed Preview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (preferences) setItems(recommendFeed(preferences, MOCK_CONTENT));
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/30"
            >
              Refresh Feed ↻
            </button>
            <Link
              href="/build/profile"
              className="rounded-xl border border-violet-500/30 bg-violet-600/20 px-3.5 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-600/30 hover:border-violet-400"
            >
              ← Daily Mission
            </Link>
            <Link
              href="/build"
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white hover:border-white/30"
            >
              Adjust Signal
            </Link>
          </div>
        </header>

        {/* Empty state when no preferences are set */}
        {!hasSignal && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl text-amber-300">
              ⚡
            </div>
            <h2 className="mt-3 text-lg font-bold text-white">No Signal Defined Yet</h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-amber-200/80">
              You haven&apos;t set any interests yet. Head over to the Signal Builder to shape your algorithm preferences.
            </p>
            <div className="mt-4">
              <Link
                href="/build"
                className="inline-flex items-center rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-500 shadow-md shadow-violet-600/30"
              >
                Go to Signal Builder →
              </Link>
            </div>
          </div>
        )}

        {/* Render the ranked feed */}
        {hasSignal && items.length > 0 && (
          <ul className="space-y-4">
            {items.map((item, idx) => (
              <li
                key={item.content.id}
                className="rounded-2xl border border-white/10 bg-[#0c0817]/60 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-violet-500/40 hover:bg-[#0e0a1f]/80"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {item.content.image && (
                    <div className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                      <Image
                        src={item.content.image}
                        alt={item.content.title}
                        width={128}
                        height={96}
                        className="w-32 h-auto object-cover"
                        priority={idx === 0}
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-bold text-white leading-snug">
                        {item.content.title}
                      </h2>
                      <ScoreBadge score={item.score} />
                    </div>
                    <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                      {item.content.description}
                    </p>
                    {item.content.source && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/50">
                          Source: {item.content.source}
                        </span>
                      </div>
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
