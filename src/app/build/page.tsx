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

interface StarterPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  interests: { id: string; name: string; strength: number }[];
  filters: FeedFilter[];
}

const STARTER_PRESETS: StarterPreset[] = [
  {
    id: "developer",
    name: "Software Engineer",
    icon: "💻",
    description: "Programming, AI & Linux tutorials without clickbait",
    interests: [
      { id: "programming", name: "Programming", strength: 85 },
      { id: "ai", name: "AI", strength: 75 },
      { id: "linux", name: "Linux", strength: 65 },
    ],
    filters: ["Clickbait", "Celebrity content"],
  },
  {
    id: "fitness",
    name: "Fitness & Nutrition",
    icon: "🏋️",
    description: "Strength training, recovery & nutrition form guides",
    interests: [
      { id: "fitness", name: "Fitness", strength: 85 },
      { id: "nutrition", name: "Nutrition", strength: 75 },
      { id: "running", name: "Running", strength: 60 },
    ],
    filters: ["Clickbait", "Promotional content"],
  },
  {
    id: "creator",
    name: "Visual Creative",
    icon: "📸",
    description: "Photography techniques, composition & design workflows",
    interests: [
      { id: "photography", name: "Photography", strength: 85 },
      { id: "design", name: "Design", strength: 75 },
      { id: "wildlife", name: "Wildlife", strength: 60 },
    ],
    filters: ["Low-quality content", "Repetitive content"],
  },
  {
    id: "gamer",
    name: "Gaming & Tech",
    icon: "🎮",
    description: "In-depth game analysis, reviews & gaming hardware",
    interests: [
      { id: "gaming", name: "Gaming", strength: 85 },
      { id: "technology", name: "Technology", strength: 70 },
      { id: "science", name: "Science", strength: 55 },
    ],
    filters: ["Promotional content", "Clickbait"],
  },
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
    const timeout = window.setTimeout(() => {
      const stored = loadPreferences();

      setSelected(stored.interests ?? []);
      setContentPrefs(mergeContentPreferences(stored.contentPreferences));
      setSelectedFilters(stored.filters ?? []);
      setHasLoadedPreferences(true);
    }, 0);

    return () => window.clearTimeout(timeout);
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

  const applyPreset = (preset: StarterPreset) => {
    setSelected(preset.interests);
    setSelectedFilters(preset.filters);
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
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-xs uppercase tracking-wider text-white/50 transition hover:text-white"
              >
                ← Back to Home
              </Link>
              <Link
                href="/build/profile"
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Go to Dashboard →
              </Link>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-white/45">
              {step.toString().padStart(2, "0")} / Build your feed
            </p>
            <h1 className="mt-2 text-4xl font-medium leading-tight text-white md:text-6xl">
              Build your signal.
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-white/55">
              Tell FeedSmith what deserves your attention.
            </p>

            {/* Progress indicator with purpose statements */}
            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-white/35">
                <span className={step === 1 ? "text-violet-300" : step > 1 ? "text-white/60" : ""}>01</span>
                <span className={`h-px ${step > 1 ? "bg-white/30" : "bg-white/15"}`} />
                <span className={step === 2 ? "text-violet-300" : step > 2 ? "text-white/60" : ""}>02</span>
                <span className={`h-px ${step > 2 ? "bg-white/30" : "bg-white/15"}`} />
                <span className={step === 3 ? "text-violet-300" : ""}>03</span>
              </div>
              <div className="flex justify-between text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/35">
                <span className={step === 1 ? "text-white/70" : ""}>Interests</span>
                <span className={step === 2 ? "text-white/70" : ""}>Content</span>
                <span className={step === 3 ? "text-white/70" : ""}>Filters</span>
              </div>
              {/* Progress bar */}
              <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          </header>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-center">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur-xl md:p-8">
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
                      {/* Step purpose with user-focused question */}
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-1.5">
                        Step 1 — Your Interests
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        What do you want more of?
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                        Choose topics to train your algorithm towards. Or pick a starter persona below:
                      </p>
                    </div>

                    {/* Starter Presets */}
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-300 mb-2.5">
                        ⚡ Quick Starter Profiles
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {STARTER_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-2.5 text-left transition hover:border-violet-400/50 hover:bg-violet-500/10 hover:scale-[1.02]"
                          >
                            <span className="text-base">{preset.icon}</span>
                            <span className="mt-1 text-xs font-semibold text-white">{preset.name}</span>
                            <span className="mt-0.5 text-[10px] text-white/50 line-clamp-2">{preset.description}</span>
                          </button>
                        ))}
                      </div>
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
                      {/* Step purpose with user-focused question */}
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400 mb-2">
                        Step 2 — Content Style
                      </p>
                      <h2 className="text-2xl font-medium">
                        How do you want that content?
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Adjust how you want your interests to appear — educational, entertaining, news, tutorials, or discussions.
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
                      {/* Step purpose with user-focused question */}
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400 mb-2">
                        Step 3 — Content Filters
                      </p>
                      <h2 className="text-2xl font-medium">
                        What do you want less of?
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Identify content patterns you want to reduce. Filters help shape your signal more intentionally.
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

            {/* Ensure the visualisation container stays square so the orbit map renders as a circle */}
            <aside
              className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-md"
              style={{ aspectRatio: '1', minWidth: '360px', minHeight: '360px' }}
            >
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
