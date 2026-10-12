"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadPreferences } from "@/lib/feed/preferences";
import { generateSignalBlueprint } from "@/lib/feed/blueprint";
import { generateFeedTrainingPlan } from "@/lib/feed/training";
import {
  FeedTrainingDay,
  TrainingAction,
} from "@/lib/feed/types";

/** Simple utility to generate a human‑readable plain‑text version of a plan. */
function generatePlainText(plan: { summary: string; days: FeedTrainingDay[]; platform: string }): string {
  const lines: string[] = [];
  lines.push("FEEDSMITH — FEED TRAINING PLAN");
  lines.push(`Target Platform: ${plan.platform.toUpperCase()}`);
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
      lines.push(`${prefix} [${action.type}] ${action.title}`);
      if (action.description) lines.push(`   ${action.description}`);
    });
    lines.push("");
  }
  return lines.join("\n");
}

export default function ShareablePlanPage() {
  const [plan, setPlan] = useState<{ summary: string; days: FeedTrainingDay[]; platform: string } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const prefs = loadPreferences();
      if (!prefs.interests || prefs.interests.length === 0) {
        setHasLoaded(true);
        return;
      }
      const blueprint = generateSignalBlueprint(prefs);
      const generated = generateFeedTrainingPlan(blueprint, prefs.platform ?? "youtube");
      setPlan({
        summary: generated.summary,
        days: generated.days,
        platform: generated.platform,
      });
      setHasLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    if (!plan) return;
    const plainText = generatePlainText(plan);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "FeedSmith — My Feed Training Plan",
          text: plainText,
        });
        return;
      } catch {
        // Fall back to copy
      }
    }
    await handleCopy();
  };

  const handleCopy = async () => {
    if (!plan) return;
    try {
      const plainText = generatePlainText(plan);
      await navigator.clipboard.writeText(plainText);
      setCopyStatus("✓ Copied plain text to clipboard!");
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!hasLoaded) {
    return (
      <main className="min-h-screen bg-[#08050f] p-8 text-white flex items-center justify-center">
        <div className="text-sm text-white/50">Loading training plan…</div>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="min-h-screen bg-[#08050f] p-8 text-white flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <div className="text-lg font-semibold text-white">No Signal Defined Yet</div>
          <p className="text-sm text-white/60">
            Build your Signal Blueprint first to generate a complete, shareable 7-day training plan.
          </p>
          <Link
            href="/build"
            className="inline-block rounded-full bg-violet-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition"
          >
            Build Signal Blueprint →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08050f] text-white py-12 px-6">
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          article { border-color: #ccc !important; color: black !important; page-break-inside: avoid; }
          h1, h2, h3, p, strong { color: black !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="no-print flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/build/profile"
            className="text-xs uppercase tracking-wider text-violet-400 hover:text-white transition flex items-center gap-1.5"
          >
            ← Back to Daily Mission
          </Link>
          <span className="text-xs text-white/40">Target Platform: <span className="font-semibold uppercase text-violet-300">{plan.platform}</span></span>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            7-Day Feed Training Plan
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-2xl">
            {plan.summary}
          </p>
        </div>

        {/* Action buttons */}
        <div className="no-print flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
          >
            📤 Share Plan
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
          >
            📋 Copy Plain Text
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
          >
            🖨️ Print / Save PDF
          </button>
          {copyStatus && (
            <span className="text-xs font-medium text-emerald-400 animate-fade-in">
              {copyStatus}
            </span>
          )}
        </div>

        {/* Daily cards */}
        <section className="space-y-6">
          {plan.days.map(day => (
            <article
              key={day.day}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-3">
                <h2 className="text-base font-semibold text-white">
                  DAY {String(day.day).padStart(2, "0")} — {day.stage}
                </h2>
                <span className="text-xs text-violet-300/80">{day.goal}</span>
              </header>

              <ul className="space-y-2.5 text-xs text-white/80">
                {day.actions.map(action => (
                  <li key={action.id} className="flex items-start gap-2.5">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300 shrink-0">
                      {action.type}
                    </span>
                    <div>
                      <span className="font-semibold text-white">{action.title}</span>
                      {action.description && (
                        <p className="mt-0.5 text-[11px] text-white/60">{action.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
