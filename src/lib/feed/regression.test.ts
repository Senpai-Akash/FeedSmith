import assert from "node:assert/strict";
import test from "node:test";

import { generateSignalBlueprint } from "./blueprint";
import {
  generateFeedTrainingPlan,
  calculateDayProgress,
  calculatePlanProgress,
  normalizeCompletedActions,
} from "./training";
import { generatePersonalizedDiscovery } from "./discoveryEngine";
import { getPlaybookInstruction } from "./playbook";
import {
  recordFeedback,
  removeFeedback,
  normalizeUserFeedback,
  normalizeFeedbackMeta,
  createFeedbackMeta,
  clearUserFeedbackMeta,
  FEEDBACK_STORAGE_KEY,
} from "./feedback";
import {
  calculateDerivedSignal,
  scoreTopicWithFeedback,
  rankDiscoveryWithFeedback,
} from "./adaptiveEngine";
import {
  deriveTrainingHistory,
  updateTrainingHistoryMeta,
  calculateConsistency,
  calculateOverallProgress,
  calculateTopicsReinforced,
  clearTrainingHistoryMeta,
  createTrainingHistoryMeta,
  TRAINING_HISTORY_STORAGE_KEY,
} from "./history";
import { generateIntelligence, computeGapSummary } from "./signalIntelligence";
import { createSignalSnapshot, compareSnapshots, deriveLongTermInsights } from "./snapshot";
import { normalizePreferences } from "./preferences";
import type { FeedPreferences, TrainingAction } from "./types";

const mockPreferences: FeedPreferences = {
  interests: [
    { id: "ai", name: "AI", strength: 90 },
    { id: "programming", name: "Programming", strength: 80 },
    { id: "science", name: "Science", strength: 60 },
  ],
  contentPreferences: [
    { id: "tutorials", name: "Tutorials", strength: 85 },
    { id: "educational", name: "Educational", strength: 70 },
  ],
  filters: ["clickbait", "gossip"],
};

test("REGRESSION: Blueprint generation preserves primary, secondary, and filters", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);

  assert.equal(blueprint.primaryInterests.length, 2);
  assert.equal(blueprint.primaryInterests[0].id, "ai");
  assert.equal(blueprint.primaryInterests[1].id, "programming");
  assert.equal(blueprint.secondaryInterests.length, 1);
  assert.equal(blueprint.secondaryInterests[0].id, "science");
  assert.deepEqual(blueprint.suppressed, ["clickbait", "gossip"]);
  assert.equal(blueprint.overallStrength, Math.round((90 + 80 + 60) / 3));
  assert.ok(blueprint.summary.includes("AI and Programming"));
});

test("REGRESSION: Seven-day plan generation produces complete days with correct platform", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const plan = generateFeedTrainingPlan(blueprint, "youtube");

  assert.equal(plan.platform, "youtube");
  assert.equal(plan.days.length, 7);
  for (let i = 0; i < 7; i++) {
    assert.equal(plan.days[i].day, i + 1);
    assert.ok(plan.days[i].actions.length > 0);
  }

  // YouTube creator actions should be SUBSCRIBE, not FOLLOW
  const creatorActions = plan.days.flatMap(d => d.actions).filter(a => a.type === "SUBSCRIBE" || a.type === "FOLLOW");
  assert.ok(creatorActions.length > 0);
  assert.ok(creatorActions.every(a => a.type === "SUBSCRIBE"));
});

test("REGRESSION: Discovery ranking sorts items by relevance and allows adaptive re-ranking", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 0 });

  assert.ok(discovery.items.length > 0);
  // Initial items should be sorted descending by relevance
  for (let i = 0; i < discovery.items.length - 1; i++) {
    assert.ok(
      discovery.items[i].relevance >= discovery.items[i + 1].relevance ||
        discovery.items[i].title <= discovery.items[i + 1].title
    );
  }

  // Adaptive re-ranking
  const adaptiveState = calculateDerivedSignal(blueprint, [
    {
      id: "fb-1",
      actionId: "act-1",
      topicId: "science",
      value: "MORE",
      timestamp: new Date().toISOString(),
      trainingDay: 1,
    },
  ]);

  const reRanked = rankDiscoveryWithFeedback(discovery.items, adaptiveState);
  assert.equal(reRanked.length, discovery.items.length);
});

test("REGRESSION: Platform-specific guidance formats instructions correctly for each platform", () => {
  const action: TrainingAction = {
    id: "act-1",
    type: "SEARCH",
    title: 'Search "Python"',
    description: "Search Python",
    why: "Reinforces programming",
    query: "Python programming",
    platform: "instagram",
    topic: "programming",
    topicName: "Programming",
  };

  const igGuidance = getPlaybookInstruction(action, "instagram");
  assert.ok(igGuidance.what.includes("Python programming"));
  assert.ok(igGuidance.how.includes("Instagram"));
  assert.ok(igGuidance.do.length > 0);
  assert.ok(igGuidance.dont.length > 0);

  const ytGuidance = getPlaybookInstruction(action, "youtube");
  assert.ok(ytGuidance.how.includes("Youtube"));
});

test("REGRESSION: Action completion and plan progress tracking counts correctly", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const plan = generateFeedTrainingPlan(blueprint);

  const day1Action1 = plan.days[0].actions[0].id;
  const day1Action2 = plan.days[0].actions[1].id;

  const completedMap = normalizeCompletedActions({
    [day1Action1]: true,
    [day1Action2]: true,
    "non-existent": true,
  });

  const dayProgress = calculateDayProgress(plan.days[0], completedMap);
  assert.equal(dayProgress.completedCount, 2);
  assert.ok(dayProgress.progressPercent > 0);

  const planProgress = calculatePlanProgress(plan, completedMap);
  assert.equal(planProgress.completedCount, 2);
  assert.ok(planProgress.totalActions > 2);
});

test("REGRESSION: Feedback recording and management handles lifecycle safely", () => {
  const initial = createFeedbackMeta();
  assert.equal(initial.version, 1);
  assert.equal(initial.items.length, 0);

  const { meta: updated, feedback } = recordFeedback(initial, {
    actionId: "action-123",
    topicId: "ai",
    value: "MORE",
    trainingDay: 1,
  });

  assert.equal(updated.items.length, 1);
  assert.equal(feedback.value, "MORE");
  assert.equal(feedback.topicId, "ai");

  // Updating the same action updates in place
  const { meta: updated2 } = recordFeedback(updated, {
    actionId: "action-123",
    topicId: "ai",
    value: "LESS",
    trainingDay: 1,
  });
  assert.equal(updated2.items.length, 1);
  assert.equal(updated2.items[0].value, "LESS");

  // Remove feedback
  const removed = removeFeedback(updated2, "action-123");
  assert.equal(removed.items.length, 0);
});

test("REGRESSION: Adaptive plan generation alters topic weights without mutating blueprint", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const originalAiStrength = blueprint.primaryInterests[0].strength;

  const adaptiveState = calculateDerivedSignal(blueprint, [
    {
      id: "fb-1",
      actionId: "act-1",
      topicId: "ai",
      value: "MORE",
      timestamp: new Date().toISOString(),
      trainingDay: 1,
    },
  ]);

  const adaptedPlan = generateFeedTrainingPlan(blueprint, "instagram", adaptiveState);
  assert.equal(blueprint.primaryInterests[0].strength, originalAiStrength, "Blueprint must not be mutated");
  assert.ok(adaptedPlan.days.length === 7);
  assert.ok(adaptiveState.topics["ai"].adjustedStrength > originalAiStrength);
});

test("REGRESSION: Training history metadata derivation and progress calculations", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const plan = generateFeedTrainingPlan(blueprint);

  const emptyMeta = createTrainingHistoryMeta();
  const history = deriveTrainingHistory(plan, {}, emptyMeta);

  assert.equal(history.completedDays, 0);
  assert.equal(history.status, "NOT_STARTED");
  assert.equal(history.currentDay, 1);

  const overall = calculateOverallProgress(history);
  assert.equal(overall.daysCompleted, 0);
  assert.equal(overall.actionsCompleted, 0);

  const consistency = calculateConsistency(history);
  assert.equal(consistency.completedPlannedDays, 0);
  assert.equal(consistency.percentage, 0);
});

test("REGRESSION: Signal drift detection computes health and priorities", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const currentSignal = {
    ai: 30, // desired 90 (gap -60)
    programming: 80, // desired 80 (gap 0)
    gossip: 60, // suppressed but high in current
  };

  const intel = generateIntelligence(blueprint, currentSignal);
  assert.ok(intel.overallSignalHealth.score < 100);
  assert.ok(["Developing", "Weak", "Poor"].includes(intel.overallSignalHealth.status));

  // Should have priority to strengthen AI
  const aiPriority = intel.priorities.find(p => p.category === "ai");
  assert.ok(aiPriority);
  assert.equal(aiPriority.direction, "strengthen");

  // Should detect suppression priority for gossip
  const gossipSuppression = intel.suppressionPriorities.find(s => s.category === "gossip");
  assert.ok(gossipSuppression);
  assert.equal(gossipSuppression.priority, "HIGH");

  const gapSummary = computeGapSummary(blueprint, currentSignal);
  assert.equal(gapSummary["ai"].desired, 90);
  assert.equal(gapSummary["ai"].current, 30);
});

test("REGRESSION: Signal evolution creates snapshots and derives trend insights", () => {
  const snap1 = createSignalSnapshot({
    prefs: mockPreferences,
    cycleId: 1,
  });
  assert.equal(snap1.cycleId, 1);
  assert.equal(snap1.interests.length, 3);

  const nextPrefs: FeedPreferences = {
    ...mockPreferences,
    interests: [
      { id: "ai", name: "AI", strength: 95 }, // strengthened
      { id: "programming", name: "Programming", strength: 80 },
      // science removed
      { id: "robotics", name: "Robotics", strength: 75 }, // added
    ],
  };

  const snap2 = createSignalSnapshot({
    prefs: nextPrefs,
    cycleId: 2,
  });

  const diff = compareSnapshots(snap1, snap2);
  assert.deepEqual(diff.addedInterests.map(i => i.id), ["robotics"]);
  assert.deepEqual(diff.removedInterests.map(i => i.id), ["science"]);
  assert.deepEqual(diff.strengthened.map(i => i.id), ["ai"]);

  const insights = deriveLongTermInsights([snap1, snap2]);
  assert.ok(insights.insights.length > 0);
  assert.ok(insights.consistency);
});

test("REGRESSION: Preferences normalization sanitizes corrupted data cleanly", () => {
  const malformed = {
    interests: [
      { id: "ai", name: "AI", strength: "invalid" },
      { id: "  ", name: "blank", strength: 50 },
      { id: "prog", name: "Programming", strength: 150 }, // out of bounds
    ],
    contentPreferences: null,
    filters: ["test", null, "test"],
  };

  const normalized = normalizePreferences(malformed);
  assert.equal(normalized.interests.length, 2);
  assert.equal(normalized.interests[0].id, "prog");
  assert.equal(normalized.interests[0].strength, 100); // capped at 100
  assert.equal(normalized.interests[1].id, "ai");
  assert.equal(normalized.interests[1].strength, 0); // sanitized to 0
  assert.deepEqual(normalized.filters, ["test"]); // deduplicated & sanitized
});

test("REGRESSION: Clear-history and reset functions do not throw in node environment", () => {
  assert.doesNotThrow(() => clearTrainingHistoryMeta());
  assert.doesNotThrow(() => clearUserFeedbackMeta());
});

test("REGRESSION: History meta updates and reinforced topics calculations", () => {
  const blueprint = generateSignalBlueprint(mockPreferences);
  const plan = generateFeedTrainingPlan(blueprint);
  const meta = createTrainingHistoryMeta();
  const updatedMeta = updateTrainingHistoryMeta(meta, plan, { [plan.days[0].actions[0].id]: true });
  assert.equal(updatedMeta.version, 1);
  assert.ok(TRAINING_HISTORY_STORAGE_KEY.length > 0);

  const reinforced = calculateTopicsReinforced(plan, { [plan.days[0].actions[0].id]: true });
  assert.ok(Array.isArray(reinforced));
});

test("REGRESSION: User feedback normalization and storage keys", () => {
  const norm = normalizeUserFeedback({
    actionId: "act-1",
    topicId: "ai",
    value: "MORE",
    trainingDay: 1,
  });
  assert.ok(norm);
  assert.equal(norm.value, "MORE");

  const meta = normalizeFeedbackMeta({ version: 1, items: [norm] });
  assert.equal(meta.items.length, 1);
  assert.ok(FEEDBACK_STORAGE_KEY.length > 0);

  const score = scoreTopicWithFeedback("ai");
  assert.equal(typeof score, "number");
});

