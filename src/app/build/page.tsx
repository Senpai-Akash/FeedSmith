"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrbitVisualization from "@/components/landing/OrbitVisualization";
import { loadPreferences, savePreferences, FeedPreference, Interest } from "@/lib/feed/preferences";
import { INTERESTS as ALL_INTERESTS } from "@/lib/feed/interestData";
import { ContentPreference, FeedFilter } from "@/lib/feed/types";

// Use centralized interest list
const INTERESTS: Interest[] = ALL_INTERESTS as unknown as Interest[];

// Content preference categories
const CONTENT_CATEGORIES: ContentPreference[] = [
  { id: "educational", name: "Educational", strength: 50 },
  { id: "entertainment", name: "Entertainment", strength: 50 },
  { id: "news", name: "News", strength: 50 },
  { id: "tutorials", name: "Tutorials", strength: 50 },
  { id: "discussions", name: "Discussions", strength: 50 },
];

// Filter options
const FILTER_OPTIONS: FeedFilter[] = [
  "Clickbait",
  "Repetitive content",
  "Low-quality content",
  "Celebrity content",
  "Promotional content",
];

function mapToVisualizationData(prefs: FeedPreference[]) {
  // Map strengths to radius (stronger => smaller radius)
  const maxRadius = 260;
  const minRadius = 80;
  const maxStrength = 100;
  const minStrength = 0;
  const radiusScale = (strength: number) =>
    maxRadius - ((strength - minStrength) / (maxStrength - minStrength)) * (maxRadius - minRadius);

  // Sort by strength descending for nicer visual ordering
  const sorted = [...prefs].sort((a, b) => b.strength - a.strength);
  return sorted.map(p => ({
    label: p.name,
    radius: Math.round(radiusScale(p.strength)),
    period: 40,
    percent: p.strength,
    initialAngle: 0,
  }));
}

export default function BuildPage() {
  // Step management (1 = interests, 2 = content prefs, 3 = filters)
  const [step, setStep] = useState<number>(1);

  const [selected, setSelected] = useState<FeedPreference[]>([]);
  const [contentPrefs, setContentPrefs] = useState<ContentPreference[]>(CONTENT_CATEGORIES);
  const [selectedFilters, setSelectedFilters] = useState<FeedFilter[]>([]);

  // Load from localStorage on mount
  // Load persisted state on mount
  useEffect(() => {
    const stored = loadPreferences();
    if (stored.interests?.length) setSelected(stored.interests);
    if (stored.contentPreferences?.length) setContentPrefs(stored.contentPreferences);
    if (stored.filters?.length) setSelectedFilters(stored.filters);
  }, []);

  // Persist whenever selected changes
  // Persist any change in the whole builder state
  useEffect(() => {
    savePreferences({
      interests: selected,
      contentPreferences: contentPrefs,
      filters: selectedFilters,
    });
  }, [selected, contentPrefs, selectedFilters]);

  const toggleInterest = (interest: Interest) => {
    setSelected(prev => {
      const exists = prev.find(p => p.id === interest.id);
      if (exists) {
        return prev.filter(p => p.id !== interest.id);
      }
      // Add with default strength 50
      return [...prev, { id: interest.id, name: interest.name, strength: 50 }];
    });
  };

  const updateStrength = (id: string, strength: number) => {
    setSelected(prev =>
      prev.map(p => (p.id === id ? { ...p, strength } : p))
    );
  };

  const isSelected = (id: string) => selected.some(p => p.id === id);

  const canContinueStep1 = selected.length > 0;
  const canContinueStep2 = contentPrefs.some(cp => cp.strength > 0);
  const canContinue = step === 1 ? canContinueStep1 : step === 2 ? canContinueStep2 : true;

  const vizData = mapToVisualizationData(selected);

  return (
    <section className="min-h-screen bg-black/30 text-white py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row gap-12">
        {/* Left panel – controls */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-medium">Build your feed.</h1>
            <p className="text-gray-400 max-w-md">
              Tell FeedSmith what deserves your attention.
            </p>

            {/* STEP CONTENT */}
            {step === 1 && (
              <>
                {/* Interest selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest)}
                      className={`p-2 rounded border transition-colors ${isSelected(interest.id) ? "border-violet-400 bg-violet-900/30 text-white" : "border-gray-600 text-gray-400"}`}
                    >
                      {interest.name}
                    </button>
                  ))}
                </div>

                {/* Strength sliders for selected interests */}
                <div className="mt-6 space-y-4">
                  {selected.map(p => (
                    <div key={p.id} className="flex items-center space-x-4">
                      <span className="w-24 text-sm">{p.name}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={p.strength}
                        onChange={e => updateStrength(p.id, Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{p.strength}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-medium">What kind of content do you want?</h2>
                <div className="mt-4 space-y-4">
                  {contentPrefs.map(cp => (
                    <div key={cp.id} className="flex items-center space-x-4">
                      <span className="w-32 text-sm">{cp.name}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={cp.strength}
                        onChange={e =>
                          setContentPrefs(prev =>
                            prev.map(item => (item.id === cp.id ? { ...item, strength: Number(e.target.value) } : item))
                          )
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{cp.strength}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-medium">What should FeedSmith avoid?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  {FILTER_OPTIONS.map(filter => {
                    const active = selectedFilters.includes(filter);
                    return (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilters(prev =>
                            active ? prev.filter(f => f !== filter) : [...prev, filter]
                          );
                        }}
                        className={`p-2 rounded border transition-colors ${active ? "border-violet-400 bg-violet-900/30 text-white" : "border-gray-600 text-gray-400"}`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:bg-gray-800 transition"
                >
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={() => setStep(prev => prev + 1)}
                  className={`px-4 py-2 rounded bg-violet-500 text-white hover:bg-violet-600 transition ${canContinue ? "" : "opacity-50 pointer-events-none"}`}
                >
                  Continue →
                </button>
              )}
              {step === 3 && (
                <Link
                  href="/build/profile"
                  className="px-4 py-2 rounded bg-violet-500 text-white hover:bg-violet-600 transition"
                >
                  Review →
                </Link>
              )}
            </div>
          </div>

        {/* Right panel – orbit visualization */}
        <div className="flex-1 flex items-center justify-center">
          <OrbitVisualization interests={vizData} />
        </div>
      </div>
    </section>
  );
}
