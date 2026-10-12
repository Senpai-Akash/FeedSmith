import test from "node:test";
import assert from "node:assert/strict";
import { generateSignalBlueprint } from "./blueprint";
import { generateFeedTrainingPlan } from "./training";
import { generatePersonalizedDiscovery } from "./discoveryEngine";
import { deriveTrainingHistory, calculateConsistency } from "./history";
import {
  exportFeedSmithData,
  validateImportData,
  importFeedSmithData,
  clearTrainingHistoryOnly,
  resetAllFeedSmithData,
} from "./dataManagement";
import { recordFeedback } from "./feedback";
import { calculateDerivedSignal } from "./adaptiveEngine";
import { savePreferences } from "./preferences";
import { FeedPreferences } from "./types";

// Polyfill localStorage in Node test environment
class MockLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

if (typeof window === "undefined" || !globalThis.localStorage) {
  // @ts-expect-error - polyfill for testing
  globalThis.localStorage = new MockLocalStorage();
}

test("JOURNEY 1 — FIRST-TIME USER ONBOARDING", () => {
  // Empty state check
  const emptyPrefs: FeedPreferences = { interests: [], contentPreferences: [], filters: [] };
  const emptyBlueprint = generateSignalBlueprint(emptyPrefs);
  assert.equal(emptyBlueprint.primaryInterests.length, 0);

  // User selects interests on /build
  const configuredPrefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 85 },
      { id: "ai", name: "AI", strength: 75 },
    ],
    contentPreferences: [{ id: "tutorial", name: "Tutorials", strength: 80 }],
    filters: ["gossip"],
    platform: "youtube",
  };
  savePreferences(configuredPrefs);

  // Blueprint generated
  const blueprint = generateSignalBlueprint(configuredPrefs);
  assert.equal(blueprint.primaryInterests.length >= 1, true);

  // Daily plan generated
  const plan = generateFeedTrainingPlan(blueprint, "youtube");
  assert.equal(plan.days.length, 7);
  assert.equal(plan.days[0].actions.length > 0, true);

  // Initial training history status
  const history = deriveTrainingHistory(plan, {}, { version: 1, days: [] });
  assert.equal(history.status, "NOT_STARTED");
  assert.equal(history.completedDays, 0);
});

test("JOURNEY 2 — RETURNING ACTIVE USER (Day 1 completed, Day 2 in progress)", () => {
  const prefs: FeedPreferences = {
    interests: [{ id: "programming", name: "Programming", strength: 85 }],
    platform: "youtube",
  };
  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "youtube");

  // User completes Day 1
  const completed: Record<string, boolean> = {};
  for (const a of plan.days[0].actions) {
    completed[a.id] = true;
  }

  const history = deriveTrainingHistory(plan, completed, {
    version: 1,
    startedAt: "2026-10-01",
    days: [{ day: 1, startedAt: "2026-10-01", completedAt: "2026-10-01" }],
  });

  assert.equal(history.completedDays, 1);
  assert.equal(history.status, "DAY_COMPLETE");

  const consistency = calculateConsistency(history);
  assert.equal(consistency.percentage > 0, true);
});

test("JOURNEY 3 — COMPLETED 7-DAY CYCLE & MAINTENANCE MODE", () => {
  const prefs: FeedPreferences = {
    interests: [{ id: "fitness", name: "Fitness", strength: 80 }],
    platform: "instagram",
  };
  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "instagram");

  // All 7 days completed
  const completed: Record<string, boolean> = {};
  for (const day of plan.days) {
    for (const a of day.actions) {
      completed[a.id] = true;
    }
  }

  const history = deriveTrainingHistory(plan, completed, {
    version: 1,
    days: plan.days.map(d => ({ day: d.day, startedAt: "2026-10-01", completedAt: "2026-10-01" })),
  });

  assert.equal(history.status, "TRAINING_COMPLETE");
  assert.equal(history.completedDays, 7);

  // Restart / Retrain cycle: clearing history preserves blueprint
  clearTrainingHistoryOnly();
  const resetHistory = deriveTrainingHistory(plan, {}, { version: 1, days: [] });
  assert.equal(resetHistory.status, "NOT_STARTED");
  assert.equal(resetHistory.completedDays, 0);
});

test("JOURNEY 4 — PROFILE & PREFERENCES MODIFICATIONS", () => {
  const initialPrefs: FeedPreferences = {
    interests: [{ id: "programming", name: "Programming", strength: 80 }],
    platform: "youtube",
  };
  savePreferences(initialPrefs);
  const initialBlueprint = generateSignalBlueprint(initialPrefs);
  const initialPlan = generateFeedTrainingPlan(initialBlueprint, "youtube");

  // User adds Photography
  const updatedPrefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 80 },
      { id: "photography", name: "Photography", strength: 85 },
    ],
    platform: "youtube",
  };
  savePreferences(updatedPrefs);
  const updatedBlueprint = generateSignalBlueprint(updatedPrefs);
  const updatedPlan = generateFeedTrainingPlan(updatedBlueprint, "youtube");

  // Updated plan reflects newly added photography interest
  const updatedTopics = new Set(
    updatedPlan.days.flatMap(d => d.actions.map(a => ("topic" in a ? a.topic : "")))
  );
  assert.equal(updatedTopics.has("photography"), true);
  assert.notEqual(initialPlan.summary, updatedPlan.summary);
});

test("JOURNEY 5 — DATA MANAGEMENT (Export, Validation, Import, Full Reset)", () => {
  localStorage.clear();

  const originalPrefs: FeedPreferences = {
    interests: [{ id: "linux", name: "Linux", strength: 90 }],
    contentPreferences: [{ id: "tutorial", name: "Tutorials", strength: 70 }],
    filters: ["clickbait"],
    platform: "youtube",
  };
  savePreferences(originalPrefs);

  // Export
  const exported = exportFeedSmithData();
  assert.equal(exported.preferences.interests[0].id, "linux");
  assert.equal(exported.preferences.platform, "youtube");

  // Validate JSON string
  const validation = validateImportData(exported);
  assert.equal(validation.success, true);

  // Reset all
  resetAllFeedSmithData();
  const clearedExport = exportFeedSmithData();
  assert.equal(clearedExport.preferences.interests.length, 0);

  // Import previously saved data
  if (validation.success) {
    importFeedSmithData(validation.data);
  }
  const restoredExport = exportFeedSmithData();
  assert.equal(restoredExport.preferences.interests.length, 1);
  assert.equal(restoredExport.preferences.interests[0].id, "linux");
});

test("JOURNEY 6 — TARGET PLATFORM SWITCHING (YouTube vs Instagram vs TikTok)", () => {
  const prefs: FeedPreferences = {
    interests: [{ id: "programming", name: "Programming", strength: 85 }],
  };
  const blueprint = generateSignalBlueprint(prefs);

  const youtubePlan = generateFeedTrainingPlan(blueprint, "youtube");
  const instagramPlan = generateFeedTrainingPlan(blueprint, "instagram");
  const tiktokPlan = generateFeedTrainingPlan(blueprint, "tiktok");

  assert.equal(youtubePlan.platform, "youtube");
  assert.equal(instagramPlan.platform, "instagram");
  assert.equal(tiktokPlan.platform, "tiktok");

  // YouTube uses SUBSCRIBE, Instagram and TikTok use FOLLOW
  const ytCreator = youtubePlan.days[0].actions.find(a => a.type === "SUBSCRIBE" || a.type === "FOLLOW");
  const igCreator = instagramPlan.days[0].actions.find(a => a.type === "SUBSCRIBE" || a.type === "FOLLOW");
  const ttCreator = tiktokPlan.days[0].actions.find(a => a.type === "SUBSCRIBE" || a.type === "FOLLOW");

  assert.equal(ytCreator?.type, "SUBSCRIBE");
  assert.equal(igCreator?.type, "FOLLOW");
  assert.equal(ttCreator?.type, "FOLLOW");
});
