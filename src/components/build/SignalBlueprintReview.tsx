"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SignalBlueprint } from "@/lib/feed/types";

interface SignalBlueprintReviewProps {
  blueprint: SignalBlueprint;
  onStartTraining: () => void;
}

/**
 * Signal Blueprint Review Screen
 * 
 * Displayed after build completion, before training starts.
 * Shows a meaningful summary of the user's signal and explains next steps.
 */
export function SignalBlueprintReview({
  blueprint,
  onStartTraining,
}: SignalBlueprintReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-400">
          Step 4 — Signal Review
        </p>
        <h1 className="text-4xl md:text-5xl font-medium text-white">
          Your signal is ready.
        </h1>
        <p className="text-base text-white/60 max-w-2xl mx-auto">
          Here's what FeedSmith will use to build your training plan.
        </p>
      </div>

      {/* Primary Signals Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-violet-400" />
          <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-white/60">
            Primary Signals
          </h3>
        </div>
        <div className="space-y-2">
          {blueprint.primaryInterests.length > 0 ? (
            blueprint.primaryInterests.map((interest) => (
              <div
                key={interest.id}
                className="flex items-center justify-between rounded-md bg-white/5 p-3"
              >
                <span className="text-white">{interest.name}</span>
                <span className="text-xs font-medium text-violet-300">
                  {interest.strength}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/40">No primary signals</p>
          )}
        </div>
      </motion.div>

      {/* Secondary Signals Card */}
      {blueprint.secondaryInterests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
            <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-white/60">
              Secondary Signals
            </h3>
          </div>
          <div className="space-y-2">
            {blueprint.secondaryInterests.map((interest) => (
              <div
                key={interest.id}
                className="flex items-center justify-between rounded-md bg-white/5 p-3"
              >
                <span className="text-white/80">{interest.name}</span>
                <span className="text-xs font-medium text-indigo-300">
                  {interest.strength}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-md"
      >
        <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-white/60 mb-4">
          Ready for Day 1?
        </h3>
        <p className="text-sm text-white/70 mb-6">
          Your training plan is generated. Day 1 will guide you through watching, searching, following, and engaging with your signal.
        </p>
        <button
          onClick={onStartTraining}
          className="inline-flex items-center rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition hover:scale-[1.03] w-full justify-center sm:w-auto"
        >
          Start Day 1
          <span className="ml-2">→</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
