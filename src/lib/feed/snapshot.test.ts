import { test } from "node:test";
import assert from "node:assert";
import { createSignalSnapshot, compareSnapshots, deriveLongTermInsights } from "./snapshot";
import { saveTrainingHistoryMeta } from "./history";

function setMockTrainingMeta(meta: TrainingHistoryMeta) {
  // In the node test environment, the history util will bail out early, but we keep the call for API compatibility.
  saveTrainingHistoryMeta(meta);
}

test("createSignalSnapshot reflects supplied preferences", () => {
  const mockPrefs = {
    interests: [
      { id: "ai", name: "Artificial Intelligence", strength: 80 },
      { id: "ml", name: "Machine Learning", strength: 70 },
    ],
    contentPreferences: [],
    filters: ["Clickbait"],
  };
  setMockTrainingMeta({ version: 1, days: [] });
  const snapshot = createSignalSnapshot({ prefs: mockPrefs });
  assert.equal(snapshot.interests.length, 2);
  assert.equal(snapshot.interests[0].id, "ai");
  assert.ok(snapshot.suppressed.includes("Clickbait"));
  assert.equal(snapshot.overallStrength, 75);
});

test("compareSnapshots detects added, removed, strengthened, weakened interests", () => {
  const prev = createSignalSnapshot({
    prefs: {
      interests: [
        { id: "ai", name: "AI", strength: 80 },
        { id: "web", name: "Web", strength: 60 },
      ],
      contentPreferences: [],
      filters: [],
    },
  });
  const next = createSignalSnapshot({
    prefs: {
      interests: [
        { id: "ai", name: "AI", strength: 85 }, // strengthened
        { id: "cloud", name: "Cloud", strength: 55 }, // added
      ],
      contentPreferences: [],
      filters: [],
    },
  });

  const diff = compareSnapshots(prev, next);
  assert.deepStrictEqual(diff.addedInterests.map(i => i.id), ["cloud"]);
  assert.deepStrictEqual(diff.removedInterests.map(i => i.id), ["web"]);
  assert.deepStrictEqual(diff.strengthened.map(i => i.id), ["ai"]);
  assert.equal(diff.weakened.length, 0);
  assert.equal(diff.overallStrengthDelta, next.overallStrength - prev.overallStrength);
});

test("deriveLongTermInsights produces consistency and basic trend insight", () => {
  setMockTrainingMeta({
    version: 1,
    days: [
      { day: 1, startedAt: "2024-01-01", completedAt: "2024-01-01" },
      { day: 2, startedAt: "2024-01-02", completedAt: "2024-01-02" },
    ],
  });

  const snap1 = createSignalSnapshot({
    prefs: {
      interests: [{ id: "ai", name: "AI", strength: 70 }],
      contentPreferences: [],
      filters: [],
    },
  });
  const snap2 = createSignalSnapshot({
    prefs: {
      interests: [{ id: "ai", name: "AI", strength: 90 }],
      contentPreferences: [],
      filters: [],
    },
  });

  const result = deriveLongTermInsights([snap1, snap2]);
  assert.ok(result.consistency);
  assert.ok(result.insights.length > 0);
  // Ensure at least one insight string is present.
  assert.ok(result.insights.length > 0);
});
