"use client";

/**
 * Shareable FeedSmith Plan Page
 *
 * This page renders a read‑only view of the user's current training plan and
 * provides utilities to share, copy, or print the plan. It purposefully re‑uses
 * the existing deterministic plan generation logic (`generateFeedTrainingPlan`)
 * and does not introduce any new algorithms or external dependencies.
 *
 * Features:
 *   - Render plan summary and a list of daily cards.
 *   - "Share Plan" button – uses the Web Share API when available, otherwise
 *     falls back to copying the plain‑text representation to the clipboard.
 *   - "Copy Plan" button – copies a clean text version of the plan.
 *   - "Print / Save PDF" button – triggers `window.print()`.
 *   - Print‑specific CSS hides navigation and interactive controls.
 *   - All actions are keyboard accessible and have visible focus states.
 */

import { useEffect, useState } from "react";
import { loadPreferences } from "@/lib/feed/preferences";
import { generateSignalBlueprint } from "@/lib/feed/blueprint";
import { generateFeedTrainingPlan } from "@/lib/feed/training";
import {
  FeedTrainingDay,
  TrainingAction,
  TrainingActionType,
} from "@/lib/feed/types";

/** Simple utility to generate a human‑readable plain‑text version of a plan. */
function generatePlainText(plan: { summary: string; days: FeedTrainingDay[] }): string {
  const lines: string[] = [];
  lines.push("FEEDSMITH — FEED TRAINING PLAN");
  lines.push("");
  lines.push("Summary:");
  lines.push(plan.summary);
  lines.push("");
  for (const day of plan.days) {
    lines.push(`DAY ${String(day.day).padStart(2, "0")} — ${day.stage}`);
    lines.push(day.goal);
    lines.push("");
    const actions = day.actions as TrainingAction[];
    actions.forEach((action, idx) => {
      const prefix = `${idx + 1}.`;
      lines.push(`${prefix} ${action.title}`);
      if (action.description) lines.push(`   ${action.description}`);
    });
    lines.push("");
  }
  return lines.join("\n");
}

export default function ShareablePlanPage() {
  const [plan, setPlan] = useState<{ summary: string; days: FeedTrainingDay[] } | null>(
    null,
  );

  // Load preferences and generate the plan once on mount.
  useEffect(() => {
    const prefs = loadPreferences();
    const blueprint = generateSignalBlueprint(prefs);
    const generated = generateFeedTrainingPlan(blueprint);
    setPlan({ summary: generated.summary, days: generated.days });
  }, []);

  if (!plan) {
    return <div className="p-8 text-white">Loading plan…</div>;
  }

  const plainText = generatePlainText(plan);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "FeedSmith — My Feed Training Plan",
          text: plan.summary,
        });
        return;
      } catch (e) {
        // fall back to copy if sharing fails
      }
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(plainText);
    alert("Plan copied to clipboard.");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainText);
    alert("Plan copied to clipboard.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="p-8 text-white">
      {/* Print‑specific styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
      <h1 className="mb-4 text-3xl font-bold">Your Feed Training Plan</h1>
      <p className="mb-6 max-w-2xl text-lg">{plan.summary}</p>
      {/* Action buttons */}
      <div className="mb-8 flex gap-4 no-print">
        <button
          onClick={handleShare}
          className="rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-500"
        >
          Share Plan
        </button>
        <button
          onClick={handleCopy}
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
        >
          Copy Plan
        </button>
        <button
          onClick={handlePrint}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500"
        >
          Print / Save PDF
        </button>
      </div>
      {/* Daily cards */}
      <section className="space-y-8">
        {plan.days.map(day => (
          <article key={day.day} className="rounded border border-white/20 p-4">
            <header className="mb-2">
              <h2 className="text-xl font-semibold">
                DAY {String(day.day).padStart(2, "0")} — {day.stage}
              </h2>
              <p className="text-sm text-white/70">{day.goal}</p>
            </header>
            <ul className="list-disc list-inside space-y-1">
              {day.actions.map((action, idx) => (
                <li key={action.id}>
                  <strong>{action.title}</strong>: {action.description}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
