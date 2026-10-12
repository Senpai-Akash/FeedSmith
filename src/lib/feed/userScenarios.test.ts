import test from "node:test";
import assert from "node:assert/strict";
import { generateSignalBlueprint } from "./blueprint";
import { generateFeedTrainingPlan } from "./training";
import { generatePersonalizedDiscovery } from "./discoveryEngine";
import { deriveTrainingHistory } from "./history";
import { calculateDerivedSignal } from "./adaptiveEngine";
import { FeedPreferences } from "./types";

test("SCENARIO A — PROGRAMMING ENTHUSIAST (Tutorials, Software Engineering, Linux, Negative Suppression)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 90 },
      { id: "linux", name: "Linux", strength: 80 },
    ],
    contentPreferences: [
      { id: "tutorial", name: "Tutorials", strength: 85 },
      { id: "educational", name: "Educational", strength: 80 },
    ],
    filters: ["celebrity gossip", "clickbait"],
    platform: "youtube",
  };

  const blueprint = generateSignalBlueprint(prefs);
  assert.equal(blueprint.primaryInterests.length >= 1, true);
  assert.equal(blueprint.suppressed.includes("celebrity gossip"), true);

  const plan = generateFeedTrainingPlan(blueprint, "youtube");
  assert.equal(plan.days.length, 7);
  assert.equal(plan.platform, "youtube");

  // Day 1 actions should be relevant to programming & linux
  const day1 = plan.days[0];
  const watchActions = day1.actions.filter(a => a.type === "WATCH");
  assert.equal(watchActions.length > 0, true);
  for (const a of watchActions) {
    if ("topic" in a && a.topic) {
      assert.equal(["programming", "linux"].includes(a.topic), true);
    }
  }

  // Creator action should be SUBSCRIBE on YouTube
  const creatorActions = day1.actions.filter(a => a.type === "SUBSCRIBE" || a.type === "FOLLOW");
  assert.equal(creatorActions.length > 0, true);
  assert.equal(creatorActions[0].type, "SUBSCRIBE");

  // Discovery feed items should not contain suppressed terms
  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 0,
    completedActions: {},
    platform: "youtube",
  });
  for (const item of discovery.items) {
    assert.equal(item.title.toLowerCase().includes("celebrity"), false);
    assert.equal(item.title.toLowerCase().includes("gossip"), false);
  }
});

test("SCENARIO B — FITNESS BEGINNER (Beginner workouts, exercise guidance, nutrition, sustainable habits)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "fitness", name: "Fitness", strength: 85 },
      { id: "nutrition", name: "Nutrition", strength: 75 },
    ],
    contentPreferences: [
      { id: "demonstration", name: "Demonstrations", strength: 80 },
      { id: "educational", name: "Educational", strength: 75 },
    ],
    filters: ["fad diets", "unrelated drama"],
    platform: "instagram",
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "instagram");
  assert.equal(plan.platform, "instagram");

  // Instagram creator actions should use FOLLOW
  const day1 = plan.days[0];
  const creatorAction = day1.actions.find(a => a.type === "FOLLOW" || a.type === "SUBSCRIBE");
  assert.equal(creatorAction?.type, "FOLLOW");

  // Should have search queries covering fitness
  const searchActions = day1.actions.filter(a => a.type === "SEARCH");
  assert.equal(searchActions.length > 0, true);
});

test("SCENARIO C — GAMING ENTHUSIAST (Game discoveries, gameplay, reviews, technical discussions)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "fps_games", name: "FPS Games", strength: 85 },
      { id: "gaming_hardware", name: "Gaming Hardware", strength: 80 },
    ],
    contentPreferences: [
      { id: "review", name: "Reviews", strength: 85 },
      { id: "gameplay", name: "Gameplay", strength: 80 },
    ],
    filters: ["crypto promotions"],
    platform: "youtube",
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "youtube");
  assert.equal(plan.days.length, 7);

  // Search actions should be concrete gaming queries
  const day2 = plan.days[1];
  const searches = day2.actions.filter(a => a.type === "SEARCH");
  assert.equal(searches.length > 0, true);
  for (const s of searches) {
    if ("query" in s) {
      assert.equal(typeof s.query, "string");
      assert.equal(s.query.length > 0, true);
    }
  }
});

test("SCENARIO D — PHOTOGRAPHY ENTHUSIAST (Camera techniques, composition, editing workflows)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "photography", name: "Photography", strength: 90 },
      { id: "wildlife", name: "Wildlife", strength: 70 },
    ],
    contentPreferences: [
      { id: "tutorial", name: "Tutorials", strength: 80 },
    ],
    filters: ["clickbait"],
    platform: "instagram",
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "instagram");
  assert.equal(plan.days.length, 7);

  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 2,
    completedActions: {},
    platform: "instagram",
  });
  assert.equal(discovery.items.length > 0, true);
});

test("SCENARIO E — USER WITH MIXED INTERESTS (Balanced allocation without single topic dominance)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 80 },
      { id: "photography", name: "Photography", strength: 75 },
      { id: "strength_training", name: "Strength Training", strength: 70 },
    ],
    contentPreferences: [],
    filters: [],
    platform: "youtube",
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "youtube");

  // Over all 7 days, verify all 3 interests receive training actions
  const allActionTopics = new Set<string>();
  for (const day of plan.days) {
    for (const a of day.actions) {
      if ("topic" in a && typeof a.topic === "string") {
        allActionTopics.add(a.topic);
      }
    }
  }

  assert.equal(allActionTopics.has("programming"), true);
  assert.equal(allActionTopics.has("photography"), true);
  assert.equal(allActionTopics.has("strength_training"), true);
});

test("SCENARIO F — USER WITH NEGATIVE PREFERENCES (Suppress crypto, financial promos, low-quality)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 90 },
      { id: "ai", name: "AI", strength: 85 },
    ],
    contentPreferences: [],
    filters: ["crypto promotions", "financial advice", "memes"],
    platform: "youtube",
  };

  const blueprint = generateSignalBlueprint(prefs);
  assert.equal(blueprint.suppressed.length, 3);

  const plan = generateFeedTrainingPlan(blueprint, "youtube");
  // Day 1 to 7 should include AVOID actions reflecting these filters
  const avoidActions = plan.days.flatMap(d => d.actions.filter(a => a.type === "AVOID"));
  assert.equal(avoidActions.length > 0, true);

  const avoidFilters = avoidActions.map(a => ("filter" in a ? a.filter : ""));
  assert.equal(avoidFilters.includes("crypto promotions"), true);
  assert.equal(avoidFilters.includes("financial advice"), true);
});

test("SCENARIO G — RETURNING USER (7 days completed, inspect status, maintenance, and retraining)", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 90 },
    ],
    platform: "youtube",
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint, "youtube");

  // Mark all actions across all 7 days as completed
  const completed: Record<string, boolean> = {};
  for (const day of plan.days) {
    for (const a of day.actions) {
      completed[a.id] = true;
    }
  }

  const history = deriveTrainingHistory(plan, completed, { version: 1, days: [] });
  assert.equal(history.status, "TRAINING_COMPLETE");
  assert.equal(history.completedDays, 7);
  assert.equal(history.completedActions, history.totalActions);

  // Derived adaptive signal with completion bonus
  const adaptive = calculateDerivedSignal(blueprint, [], completed, 7);
  assert.equal(adaptive.overallStrength >= blueprint.overallStrength, true);
  assert.equal(["Core", "Established", "Growing"].includes(adaptive.topics["programming"].statusLabel), true);
});
