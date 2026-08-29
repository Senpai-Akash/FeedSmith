"use client";

/**
 * /build/profile – a polished, read‑only view of the user's feed preferences.
 * The page visualises the saved signal, lists interests, content style weights,
 * active filters, provides a deterministic summary, and shows a few high‑level
 * statistics. All data is sourced from the existing `loadPreferences` helper –
 * no new models are introduced.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import OrbitVisualization from "@/components/landing/OrbitVisualization";
import { loadPreferences } from "@/lib/feed/preferences";
import { generateSignalSummary } from "@/lib/feed/summary";
import { FeedPreferences } from "@/lib/feed/types";

/** Convert a 0‑100 strength value to a visual radius used by the orbit viz. */
function strengthToRadius(strength: number): number {
  const maxRadius = 260;
  const minRadius = 80;
  return Math.round(maxRadius - (strength / 100) * (maxRadius - minRadius));
}

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<FeedPreferences>({
    interests: [],
    contentPreferences: [],
    filters: [],
  });

  // Load persisted preferences once on mount.
  useEffect(() => {
    const stored = loadPreferences();
    setPrefs({
      interests: stored.interests ?? [],
      contentPreferences: stored.contentPreferences ?? [],
      filters: stored.filters ?? [],
    });
  }, []);

  // Interests sorted by descending strength.
  const sortedInterests = [...(prefs.interests ?? [])].sort((a, b) => b.strength - a.strength);

  // Data formatted for the orbit visualisation component.
  const vizData = sortedInterests.map((interest, idx) => ({
    label: interest.name,
    radius: strengthToRadius(interest.strength),
    period: 38 + idx * 2,
    percent: interest.strength,
    initialAngle: (idx * Math.PI) / 3,
  }));

  // Statistics for the "Signal Statistics" section.
  const activeInterests = sortedInterests.length;
  const avgStrength = activeInterests
    ? Math.round(sortedInterests.reduce((sum, i) => sum + i.strength, 0) / activeInterests)
    : 0;
  const contentCount = prefs.contentPreferences?.length ?? 0;
  const filterCount = prefs.filters?.length ?? 0;

  // Deterministic human‑readable summary.
  const signalSummary = generateSignalSummary(prefs);

  // If the user has not built any signal yet, show a friendly empty state.
  if (activeInterests === 0 && contentCount === 0 && filterCount === 0) {
    return (
      <section className="min-h-screen bg-black/30 text-white flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-medium">No signal built yet</h1>
          <Link
            href="/build"
            className="rounded bg-violet-500 px-5 py-2 text-white transition hover:bg-violet-600"
          >
            Build your signal →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-black/30 text-white py-12">
      {/* Header */}
      <header className="mx-auto max-w-5xl px-6 text-center lg:text-left">
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">YOUR SIGNAL</p>
        <h1 className="mt-2 text-3xl font-medium lg:text-4xl">Your feed, decoded.</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          A visual breakdown of what FeedSmith understands about your preferences.
        </p>
      </header>

      {/* Two‑column layout: text on the left, viz on the right */}
      <div className="mx-auto mt-10 max-w-7xl px-6 lg:flex lg:gap-12">
        {/* Left column – textual sections */}
        <div className="flex-1 space-y-10">
          {/* Interest Signal */}
          <section>
            <h2 className="mb-4 text-xl font-medium">INTEREST SIGNAL</h2>
            <ul className="space-y-3">
              {sortedInterests.map((interest, idx) => (
                <li key={interest.id} className="flex items-center">
                  <span className="w-8 text-sm font-mono text-white/60">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-lg">{interest.name}</span>
                  <div className="ml-4 w-32">
                    <div className="h-2 w-full rounded bg-white/10">
                      <div
                        className="h-2 rounded bg-violet-500"
                        style={{ width: `${interest.strength}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-2 w-12 text-right text-sm text-white/70">{interest.strength}%</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Content DNA */}
          <section>
            <h2 className="mb-4 text-xl font-medium">CONTENT DNA</h2>
            <ul className="space-y-3">
              {prefs.contentPreferences?.map((cp) => (
                <li key={cp.id} className="flex items-center">
                  <span className="flex-1 text-lg">{cp.name}</span>
                  <div className="ml-4 w-32">
                    <div className="h-2 w-full rounded bg-white/10">
                      <div
                        className="h-2 rounded bg-violet-400"
                        style={{ width: `${cp.strength}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-2 w-12 text-right text-sm text-white/70">{cp.strength}%</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Filtered Out */}
          <section>
            <h2 className="mb-4 text-xl font-medium">FILTERED OUT</h2>
            {filterCount > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
                {prefs.filters?.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">Nothing filtered. Your signal is open to everything.</p>
            )}
          </section>

          {/* Signal Summary */}
          <section>
            <h2 className="mb-4 text-xl font-medium">SIGNAL SUMMARY</h2>
            <p className="text-sm text-white/70">{signalSummary}</p>
          </section>

          {/* Statistics */}
          <section>
            <h2 className="mb-4 text-xl font-medium">SIGNAL STATISTICS</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
              <div>
                <p className="text-2xl font-medium text-violet-400">{activeInterests.toString().padStart(2, "0")}</p>
                <p className="text-xs uppercase text-white/60">Active Interests</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-violet-400">{avgStrength}%</p>
                <p className="text-xs uppercase text-white/60">Avg. Signal Strength</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-violet-400">{contentCount.toString().padStart(2, "0")}</p>
                <p className="text-xs uppercase text-white/60">Content Priorities</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-violet-400">{filterCount.toString().padStart(2, "0")}</p>
                <p className="text-xs uppercase text-white/60">Filters</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="pt-6">
            <h2 className="mb-4 text-xl font-medium">YOUR SIGNAL IS READY.</h2>
            <p className="mb-4 text-sm text-white/70">
              Your preferences are now ready to shape your personalized feed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/feed"
                className="rounded bg-violet-500 px-5 py-2.5 text-center text-white transition hover:bg-violet-600"
              >
                Enter your feed →
              </Link>
              <Link
                href="/build"
                className="text-sm text-white/50 underline hover:text-white"
              >
                ← Edit signal
              </Link>
            </div>
          </section>
        </div>

        {/* Right column – visual orbit */}
        <aside className="mt-10 lg:mt-0 lg:w-[420px] lg:flex-shrink-0">
          {vizData.length > 0 ? (
            <div className="relative h-[420px] w-full">
              <OrbitVisualization interests={vizData} />
            </div>
          ) : (
            <p className="text-center text-sm text-white/40">No interests to visualize.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
