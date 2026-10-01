"use client";

/**
 * Simple placeholder page for the "Long‑Term Signal Evolution & Training Insights" view.
 * It demonstrates consumption of the snapshot selector layer and renders basic JSON data.
 */
import { useEffect, useState } from "react";
import { createSignalSnapshot, deriveLongTermInsights, compareSnapshots } from "@/lib/feed/snapshot";
import type { SignalSnapshot } from "@/lib/feed/snapshot";

export default function EvolutionPage() {
  const [snapshots, setSnapshots] = useState<SignalSnapshot[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [consistencyMessage, setConsistencyMessage] = useState<string>("");

  // On mount, capture the current snapshot and store it in local state.
  useEffect(() => {
    const snap = createSignalSnapshot({});
    setSnapshots(prev => [...prev, snap]);
    // Derive insights from the accumulated snapshots.
    const { consistency, insights: newInsights } = deriveLongTermInsights([...snapshots, snap]);
    setInsights(newInsights);
    setConsistencyMessage(consistency.message);
  }, []);

  // Simple UI rendering.
  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Signal Evolution &amp; Training Insights</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Current Snapshot</h2>
        <pre className="mt-2 rounded bg-gray-900 p-4 text-xs text-white">
{JSON.stringify(snapshots[snapshots.length - 1], null, 2)}
        </pre>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Long‑Term Insights</h2>
        <ul className="list-inside list-disc">
          {insights.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Training Consistency</h2>
        <p>{consistencyMessage}</p>
      </section>
    </main>
  );
}
