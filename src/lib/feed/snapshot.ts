"use client";

/**
 * Snapshot utilities for visualising long‑term signal evolution.
 * These selectors are pure functions that can be used by UI components
 * without side‑effects. They pull data from the existing local‑storage
 * helpers (`loadPreferences` and `loadTrainingHistoryMeta`).
 */

import { loadPreferences } from "./preferences";
import { loadTrainingHistoryMeta, calculateConsistency, ConsistencyMetric } from "./history";
import type {
  FeedPreferences,
  FeedPreference,
  ContentPreference,
  FeedFilter,
  AdaptiveSignalState,
} from "./types";

/**
 * Represents a snapshot of the user's signal at a given training cycle.
 */
export interface SignalSnapshot {
  /** Cycle identifier – using the number of recorded training days. */
  cycleId: number;
  /** ISO timestamp when the snapshot was captured. */
  timestamp: string;
  /** Interests with their current strengths. */
  interests: FeedPreference[];
  /** Optional content‑style preferences. */
  contentPreferences?: ContentPreference[];
  /** List of suppressed filter identifiers. */
  suppressed: FeedFilter[];
  /** Optional adaptive signal state derived from feedback. */
  adaptiveState?: AdaptiveSignalState;
  /** Overall averaged strength of all interests (0‑100). */
  overallStrength: number;
}

/**
 * Create a snapshot from raw preferences and optional adaptive state.
 * If `cycleId` is omitted the current number of training days is used.
 */
export function createSignalSnapshot(params: {
  prefs?: FeedPreferences;
  adaptiveState?: AdaptiveSignalState;
  cycleId?: number;
  timestamp?: Date;
}): SignalSnapshot {
  const {
    prefs = loadPreferences(),
    adaptiveState,
    cycleId,
    timestamp = new Date(),
  } = params;

  const interests = prefs.interests ?? [];
  const contentPreferences = prefs.contentPreferences ?? [];
  const suppressed = prefs.filters ?? [];

  const overallStrength =
    interests.length > 0
      ? Math.round(
          interests.reduce((sum, i) => sum + i.strength, 0) / interests.length
        )
      : 0;

  const meta = loadTrainingHistoryMeta();
  const inferredCycleId = meta.days.length > 0 ? meta.days[meta.days.length - 1].day : 0;

  return {
    cycleId: cycleId ?? inferredCycleId,
    timestamp: timestamp.toISOString(),
    interests,
    contentPreferences,
    suppressed,
    adaptiveState,
    overallStrength,
  };
}

/**
 * Result of comparing two snapshots.
 */
export interface SnapshotDiff {
  addedInterests: FeedPreference[];
  removedInterests: FeedPreference[];
  strengthened: FeedPreference[]; // increased strength
  weakened: FeedPreference[]; // decreased strength
  overallStrengthDelta: number;
}

/**
 * Compare two snapshots and return a diff describing interest changes.
 */
export function compareSnapshots(
  previous: SignalSnapshot,
  next: SignalSnapshot
): SnapshotDiff {
  const prevMap = new Map(previous.interests.map(i => [i.id, i]));
  const nextMap = new Map(next.interests.map(i => [i.id, i]));

  const addedInterests: FeedPreference[] = [];
  const removedInterests: FeedPreference[] = [];
  const strengthened: FeedPreference[] = [];
  const weakened: FeedPreference[] = [];

  for (const [id, nextPref] of nextMap.entries()) {
    if (!prevMap.has(id)) {
      addedInterests.push(nextPref);
    } else {
      const prevPref = prevMap.get(id)!;
      if (nextPref.strength > prevPref.strength) {
        strengthened.push(nextPref);
      } else if (nextPref.strength < prevPref.strength) {
        weakened.push(nextPref);
      }
    }
  }

  for (const [id, prevPref] of prevMap.entries()) {
    if (!nextMap.has(id)) {
      removedInterests.push(prevPref);
    }
  }

  const overallStrengthDelta = next.overallStrength - previous.overallStrength;

  return {
    addedInterests,
    removedInterests,
    strengthened,
    weakened,
    overallStrengthDelta,
  };
}

/**
 * Derive long‑term insights from an array of snapshots.
 * Currently returns:
 *  - A consistency metric calculated from training history.
 *  - Simple textual insights based on strength trends.
 */
export function deriveLongTermInsights(snapshots: SignalSnapshot[]): {
  consistency: ConsistencyMetric;
  insights: string[];
} {
  // Consistency is based on the persisted training history meta.
  const consistency = calculateConsistency(loadTrainingHistoryMeta());

  const insights: string[] = [];
  if (snapshots.length === 0) {
    insights.push("No snapshot data available.");
    return { consistency, insights };
  }

  const strengths = snapshots.map(s => s.overallStrength);
  const max = Math.max(...strengths);
  const min = Math.min(...strengths);
  const trend = max - min;
  if (trend > 20) {
    insights.push("Your interests have shifted significantly over time.");
  } else if (trend > 5) {
    insights.push("Your interests show moderate evolution.");
  } else {
    insights.push("Your interests remain relatively stable.");
  }

  // Example insight about added/removed interests across the latest two snapshots.
  if (snapshots.length >= 2) {
    const diff = compareSnapshots(snapshots[snapshots.length - 2], snapshots[snapshots.length - 1]);
    if (diff.addedInterests.length) {
      insights.push(`Added interests: ${diff.addedInterests.map(i => i.name).join(", ")}`);
    }
    if (diff.removedInterests.length) {
      insights.push(`Removed interests: ${diff.removedInterests.map(i => i.name).join(", ")}`);
    }
  }

  return { consistency, insights };
}
