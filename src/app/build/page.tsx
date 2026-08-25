"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrbitVisualization from "@/components/landing/OrbitVisualization";
import { loadPreferences, savePreferences, FeedPreference, Interest } from "@/lib/feed/preferences";

// Initial static list of interests
const INTERESTS: Interest[] = [
  { id: "ai", name: "AI" },
  { id: "programming", name: "Programming" },
  { id: "cybersecurity", name: "Cybersecurity" },
  { id: "technology", name: "Technology" },
  { id: "design", name: "Design" },
  { id: "science", name: "Science" },
  { id: "gaming", name: "Gaming" },
  { id: "business", name: "Business" },
  { id: "music", name: "Music" },
  { id: "fitness", name: "Fitness" },
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
  const [selected, setSelected] = useState<FeedPreference[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadPreferences();
    if (stored.interests.length) {
      setSelected(stored.interests);
    }
  }, []);

  // Persist whenever selected changes
  useEffect(() => {
    savePreferences({ interests: selected });
  }, [selected]);

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

  const canContinue = selected.length > 0;

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

          <div className="mt-8 flex gap-4">
            <Link href="/" className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:bg-gray-800 transition">
              Back
            </Link>
            <Link
              href="/build/profile"
              className={`px-4 py-2 rounded bg-violet-500 text-white hover:bg-violet-600 transition ${canContinue ? "" : "opacity-50 pointer-events-none"}`}
            >
              Continue →
            </Link>
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
