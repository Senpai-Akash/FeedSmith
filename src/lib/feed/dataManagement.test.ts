import assert from "node:assert/strict";
import test from "node:test";

import {
  exportFeedSmithData,
  validateImportData,
  importFeedSmithData,
  clearTrainingHistoryOnly,
  resetAllFeedSmithData,
  PROGRESS_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
  type FeedSmithExportPayload,
} from "./dataManagement";
import { savePreferences, loadPreferences } from "./preferences";

// Mock localStorage in Node environment if needed
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

test("DATA MANAGEMENT: exports current state as valid versioned JSON payload", () => {
  localStorage.clear();

  savePreferences({
    interests: [
      { id: "programming", name: "Programming", strength: 90 },
      { id: "ai", name: "AI", strength: 80 },
    ],
    contentPreferences: [{ id: "tutorials", name: "Tutorials", strength: 75 }],
    filters: ["clickbait"],
    platform: "youtube",
  });

  const payload = exportFeedSmithData();

  assert.equal(payload.version, 1);
  assert.equal(payload.app, "FeedSmith");
  assert.ok(payload.exportedAt);
  assert.equal(payload.preferences.interests.length, 2);
  assert.equal(payload.preferences.platform, "youtube");
  assert.ok(typeof payload.progress === "object");
  assert.ok(typeof payload.historyMeta === "object");
  assert.ok(typeof payload.feedbackMeta === "object");
});

test("DATA MANAGEMENT: validateImportData accepts valid payload", () => {
  const validData: FeedSmithExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "FeedSmith",
    preferences: {
      interests: [{ id: "linux", name: "Linux", strength: 85 }],
      contentPreferences: [{ id: "educational", name: "Educational", strength: 60 }],
      filters: ["celebrity gossip"],
      platform: "instagram",
    },
    progress: {
      planKey: "plan-123",
      completed: { "day-1-watch-linux": true },
    },
    historyMeta: {
      version: 1,
      startedAt: "2026-10-01T10:00:00Z",
      days: [
        { day: 1, startedAt: "2026-10-01T10:00:00Z", completedAt: "2026-10-01T11:00:00Z" },
        { day: 2, startedAt: "2026-10-02T10:00:00Z" },
      ],
    },
    feedbackMeta: {
      version: 1,
      items: [
        {
          id: "fb-1",
          actionId: "day-1-watch-linux",
          topicId: "linux",
          value: "MORE",
          timestamp: "2026-10-01T12:00:00Z",
          trainingDay: 1,
        },
      ],
      updatedAt: "2026-10-01T12:00:00Z",
    },
  };

  const result = validateImportData(validData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.preferences.interests[0].id, "linux");
    assert.equal(result.data.preferences.platform, "instagram");
    assert.equal(result.data.progress.completed["day-1-watch-linux"], true);
  }
});

test("DATA MANAGEMENT: validateImportData rejects corrupted or incompatible payloads safely", () => {
  // Not an object
  assert.equal(validateImportData("invalid string").success, false);
  assert.equal(validateImportData(null).success, false);

  // Missing version
  assert.equal(
    validateImportData({ preferences: { interests: [] } }).success,
    false
  );

  // Out-of-bounds strength
  assert.equal(
    validateImportData({
      version: 1,
      exportedAt: new Date().toISOString(),
      preferences: {
        interests: [{ id: "test", name: "Test", strength: 150 }],
      },
    }).success,
    false
  );

  // Invalid platform
  assert.equal(
    validateImportData({
      version: 1,
      exportedAt: new Date().toISOString(),
      preferences: {
        interests: [{ id: "test", name: "Test", strength: 50 }],
        platform: "unsupported-platform",
      },
    }).success,
    false
  );

  // Invalid feedback value
  assert.equal(
    validateImportData({
      version: 1,
      exportedAt: new Date().toISOString(),
      preferences: {
        interests: [{ id: "test", name: "Test", strength: 50 }],
      },
      feedbackMeta: {
        items: {
          act1: {
            actionId: "act1",
            topicId: "test",
            value: "EXTREME_LOVE", // invalid enum
            timestamp: "2026-10-01",
          },
        },
      },
    }).success,
    false
  );
});

test("DATA MANAGEMENT: importFeedSmithData writes all structures to storage", () => {
  localStorage.clear();

  const payload: FeedSmithExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "FeedSmith",
    preferences: {
      interests: [{ id: "fitness", name: "Fitness", strength: 95 }],
      contentPreferences: [],
      filters: ["hype"],
      platform: "tiktok",
    },
    progress: {
      planKey: "plan-fit",
      completed: { "act-1": true },
    },
    historyMeta: {
      version: 1,
      days: [],
    },
    feedbackMeta: {
      version: 1,
      items: [],
    },
  };

  importFeedSmithData(payload);

  const restoredPrefs = loadPreferences();
  assert.equal(restoredPrefs.interests.length, 1);
  assert.equal(restoredPrefs.interests[0].id, "fitness");
  assert.equal(restoredPrefs.platform, "tiktok");
  assert.equal(localStorage.getItem(PROGRESS_STORAGE_KEY)?.includes("act-1"), true);
});

test("DATA MANAGEMENT: clearTrainingHistoryOnly preserves preferences while resetting progress and history", () => {
  localStorage.clear();

  savePreferences({
    interests: [{ id: "photography", name: "Photography", strength: 80 }],
    filters: ["clickbait"],
  });
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ planKey: "plan-1", completed: { a: true } }));

  clearTrainingHistoryOnly();

  // Preferences must survive
  const prefs = loadPreferences();
  assert.equal(prefs.interests.length, 1);
  assert.equal(prefs.interests[0].id, "photography");

  // Progress must be removed
  assert.equal(localStorage.getItem(PROGRESS_STORAGE_KEY), null);
});

test("DATA MANAGEMENT: resetAllFeedSmithData clears all data", () => {
  localStorage.clear();

  savePreferences({
    interests: [{ id: "gaming", name: "Gaming", strength: 70 }],
  });
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ planKey: "plan-2", completed: { b: true } }));

  resetAllFeedSmithData();

  assert.equal(localStorage.getItem(PREFERENCES_STORAGE_KEY), null);
  assert.equal(localStorage.getItem(PROGRESS_STORAGE_KEY), null);
  assert.equal(loadPreferences().interests.length, 0);
});
