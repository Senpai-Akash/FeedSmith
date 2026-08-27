"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import OrbitVisualization from "@/components/landing/OrbitVisualization";
import {
  FeedPreference,
  Interest,
  loadPreferences,
  savePreferences,
} from "@/lib/feed/preferences";
import { INTERESTS as ALL_INTERESTS } from "@/lib/feed/interestData";
import { ContentPreference, FeedFilter } from "@/lib/feed/types";

const MoltenMetal = dynamic(
  () => import("@/components/moltenmetal/MoltenMetal"),
  { ssr: false }
);

const INTERESTS: Interest[] = [...ALL_INTERESTS];

const CONTENT_CATEGORIES: ContentPreference[] = [
  { id: "educational", name: "Educational", strength: 50 },
  { id: "entertainment", name: "Entertainment", strength: 50 },
  { id: "news", name: "News", strength: 50 },
  { id: "tutorials", name: "Tutorials", strength: 50 },
  { id: "discussions", name: "Discussions", strength: 50 },
];

const FILTER_OPTIONS: FeedFilter[] = [
  "Clickbait",
  "Repetitive content",
  "Low-quality content",
  "Celebrity content",
  "Promotional content",
];

function mergeContentPreferences(
  stored: ContentPreference[] | undefined
): ContentPreference[] {
  return CONTENT_CATEGORIES.map(category => {
    const saved = stored?.find(item => item.id === category.id);
    return saved ? { ...category, strength: saved.strength } : category;
  });
}

function mapToVisualizationData(prefs: FeedPreference[]) {
  const maxRadius = 260;
  const minRadius = 80;

  return [...prefs]
    .sort((a, b) => b.strength - a.strength)
    .map((preference, index) => ({
      label: preference.name,
      radius: Math.round(
        maxRadius - (preference.strength / 100) * (maxRadius - minRadius)
      ),
      period: 38 + index * 2,
      percent: preference.strength,
      initialAngle: (index * Math.PI) / 3,
    }));
}

export default function BuildPage() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<FeedPreference[]>([]);
  const [contentPrefs, setContentPrefs] =
    useState<ContentPreference[]>(CONTENT_CATEGORIES);
  const [selectedFilters, setSelectedFilters] = useState<FeedFilter[]>([]);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

  useEffect(() => {
    const stored = loadPreferences();

    setSelected(stored.interests ?? []);
    setContentPrefs(mergeContentPreferences(stored.contentPreferences));
    setSelectedFilters(stored.filters ?? []);
    setHasLoadedPreferences(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferences) return;

    savePreferences({
      interests: selected,
      contentPreferences: contentPrefs,
      filters: selectedFilters,
    });
  }, [contentPrefs, hasLoadedPreferences, selected, selectedFilters]);

  const selectedIds = useMemo(
    () => new Set(selected.map(preference => preference.id)),
    [selected]
  );
  const vizData = useMemo(() => mapToVisualizationData(selected), [selected]);
  const canContinueStep1 = selected.length > 0;

  const toggleInterest = (interest: Interest) => {
    setSelected(current => {
      if (current.some(preference => preference.id === interest.id)) {
        return current.filter(preference => preference.id !== interest.id);
      }

      return [
        ...current,
        { id: interest.id, name: interest.name, strength: 50 },
      ];
    });
  };

  const updateInterestStrength = (id: string, strength: number) => {
    setSelected(current =>
      current.map(preference =>
        preference.id === id ? { ...preference, strength } : preference
      )
    );
  };

  const updateContentStrength = (id: string, strength: number) => {
    setContentPrefs(current =>
      current.map(preference =>
        preference.id === id ? { ...preference, strength } : preference
      )
    );
  };

  const toggleFilter = (filter: FeedFilter) => {
    setSelectedFilters(current =>
      current.includes(filter)
        ? current.filter(activeFilter => activeFilter !== filter)
        : [...current, filter]
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08050f] text-white">
      <MoltenMetal
        color1="#16002F"
        color2="#5A189A"
        color3="#E8D7FF"
        speed={0.28}
        scale={4}
        detail={3}
        glow={1.45}
        coreSize={0.1}
        swirl={1}
        fold={-0.18}
        blackPoint={0.08}
        brightness={1.15}
        colorMode="molten"
        grain
        grainIntensity={0.05}
        mouseInteraction
        mouseStrength={0.16}
        opacity={0.62}
      />

      <section className="relative z-10 min-h-screen bg-black/25 px-6 py-10 md:py-14">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
          <header>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/45">
              {step.toString().padStart(2, "0")} / Build your feed
            </p>
            <h1 className="mt-4 text-4xl font-medium leading-tight text-white md:text-6xl">
              Build your signal.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
              Tell FeedSmith what deserves your attention.
            </p>

            <div className="mt-8 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-white/35">
              <span className={step === 1 ? "text-violet-300" : ""}>01</span>
              <span className="h-px bg-white/15" />
              <span className={step === 2 ? "text-violet-300" : ""}>02</span>
              <span className="h-px bg-white/15" />
              <span className={step === 3 ? "text-violet-300" : ""}>03</span>
            </div>
            <div className="mt-3 flex justify-between text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/35">
              <span>Interests</span>
              <span>Content</span>
              <span>Filters</span>
            </div>
          </header>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-center">
            <div className="rounded-lg border border-white/10 bg-black/30 p-5 backdrop-blur-md md:p-7">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="interests"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-7"
                  >
                    <div>
                      <h2 className="text-2xl font-medium">Choose interests</h2>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Select the signals you want FeedSmith to prioritize.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {INTERESTS.map(interest => {
                        const active = selectedIds.has(interest.id);

                        return (
                          <button
                            key={interest.id}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`min-h-12 rounded-md border px-3 text-left text-sm font-medium transition ${
                              active
                                ? "border-violet-300/70 bg-violet-400/15 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/58 hover:border-white/25 hover:text-white"
                            }`}
                          >
                            {interest.name}
                          </button>
                        );
                      })}
                    </div>

                    {selected.length > 0 && (
                      <div className="space-y-4 border-t border-white/10 pt-6">
                        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/45">
                          Selected signals
                        </h3>
                        {selected.map(preference => (
                          <label
                            key={preference.id}
                            className="grid gap-2 text-sm text-white/70"
                          >
                            <span className="flex items-center justify-between gap-4">
                              <span>{preference.name}</span>
                              <span className="tabular-nums text-white/45">
                                {preference.strength}%
                              </span>
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={preference.strength}
                              onChange={event =>
                                updateInterestStrength(
                                  preference.id,
                                  Number(event.target.value)
                                )
                              }
                              className="w-full accent-violet-300"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-7"
                  >
                    <div>
                      <h2 className="text-2xl font-medium">
                        Tune content style
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Adjust how strongly each format should shape your feed.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {contentPrefs.map(preference => (
                        <label
                          key={preference.id}
                          className="grid gap-2 text-sm text-white/70"
                        >
                          <span className="flex items-center justify-between gap-4">
                            <span>{preference.name}</span>
                            <span className="tabular-nums text-white/45">
                              {preference.strength}%
                            </span>
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={preference.strength}
                            onChange={event =>
                              updateContentStrength(
                                preference.id,
                                Number(event.target.value)
                              )
                            }
                            className="w-full accent-violet-300"
                          />
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="filters"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-7"
                  >
                    <div>
                      <h2 className="text-2xl font-medium">
                        Set optional filters
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Pick anything you want FeedSmith to reduce.
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {FILTER_OPTIONS.map(filter => {
                        const active = selectedFilters.includes(filter);

                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => toggleFilter(filter)}
                            className={`min-h-12 rounded-md border px-3 text-left text-sm font-medium transition ${
                              active
                                ? "border-violet-300/70 bg-violet-400/15 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/58 hover:border-white/25 hover:text-white"
                            }`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(current => current - 1)}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/65 transition hover:border-white/30 hover:text-white"
                  >
                    ← Back
                  </button>
                )}

                {step < 3 && (
                  <button
                    type="button"
                    onClick={() => setStep(current => current + 1)}
                    disabled={step === 1 && !canContinueStep1}
                    className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100"
                  >
                    Continue →
                  </button>
                )}

                {step === 3 && (
                  <Link
                    href="/build/profile"
                    className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
                  >
                    Review →
                  </Link>
                )}
              </div>
            </div>

            <aside className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-md md:min-h-[520px]">
              <div className="absolute left-6 top-6 z-10">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/35">
                  Live signal
                </p>
                <p className="mt-2 text-sm text-white/55">
                  {selected.length} active interest
                  {selected.length === 1 ? "" : "s"}
                </p>
              </div>

              {vizData.length > 0 ? (
                <div className="absolute inset-0 scale-[0.58] sm:scale-[0.72] md:scale-[0.82] lg:scale-[0.7] xl:scale-[0.82]">
                  <OrbitVisualization interests={vizData} />
                </div>
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center px-8 text-center md:min-h-[520px]">
                  <p className="max-w-xs text-sm leading-6 text-white/38">
                    Select an interest to bring your signal map online.
                  </p>
                </div>
              )}

              <div className="pointer-events-none absolute inset-[32%] rounded-full border border-white/10 bg-white/[0.02]" />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
