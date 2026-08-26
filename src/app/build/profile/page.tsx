"use client";

import Link from "next/link";
import OrbitVisualization from "@/components/landing/OrbitVisualization";
import { loadPreferences } from "@/lib/feed/preferences";
import { generateSignalSummary } from "@/lib/feed/summary";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [preferences, setPreferences] = useState<any>({ interests: [], contentPreferences: [], filters: [] });

  useEffect(() => {
    const stored = loadPreferences();
    setPreferences(stored);
  }, []);

  const sorted = [...(preferences.interests ?? [])].sort((a, b) => b.strength - a.strength);

  const vizData = sorted.map(p => ({
    label: p.name,
    radius: Math.round(260 - (p.strength / 100) * 180), // map to 80-260
    period: 40,
    percent: p.strength,
    initialAngle: 0,
  }));

  const topThree = sorted.slice(0, 3);

  const description = generateSignalSummary(preferences);

  return (
    <section className="min-h-screen bg-black/30 text-white py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-medium">Your Signal</h1>
          {sorted.map(p => (
            <div key={p.id} className="flex justify-between text-lg">
              <span>{p.name}</span>
              <span>{p.strength}%</span>
            </div>
          ))}

          {/* Content style preferences */}
          {preferences.contentPreferences && preferences.contentPreferences.length > 0 && (
            <>
              <h2 className="mt-8 text-2xl font-medium">Content Style</h2>
              {preferences.contentPreferences.map((cp: any) => (
                <div key={cp.id} className="flex justify-between text-lg">
                  <span>{cp.name}</span>
                  <span>{cp.strength}%</span>
                </div>
              ))}
            </>
          )}

          {/* Selected filters */}
          {preferences.filters && preferences.filters.length > 0 && (
            <>
              <h2 className="mt-8 text-2xl font-medium">Avoid Filters</h2>
              <ul className="list-disc list-inside">
                {preferences.filters.map((f: string) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </>
          )}
           <h2 className="mt-8 text-2xl font-medium">Your Top Signals</h2>
           {topThree.map(p => (
             <div key={p.id} className="flex justify-between">
               <span>{p.name}</span>
               <span>{p.strength}%</span>
             </div>
           ))}
          <p className="mt-4 text-gray-400">{description}</p>
          <div className="mt-8 flex gap-4">
            <Link href="/build" className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:bg-gray-800 transition">
              Back
            </Link>
            <Link href="/feed" className="px-4 py-2 rounded bg-violet-500 text-white hover:bg-violet-600 transition">
              Continue to your feed →
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <OrbitVisualization interests={vizData} />
        </div>
      </div>
    </section>
  );
}
