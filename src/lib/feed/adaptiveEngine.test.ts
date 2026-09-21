import assert from "node:assert/strict";
import test from "node:test";

import { generateSignalBlueprint } from "./blueprint";
import { generateFeedTrainingPlan } from "./training";
import { generatePersonalizedDiscovery } from "./discoveryEngine";
import { calculateDerivedSignal, recordFeedback, createFeedbackMeta } from "./feedback";
import { scoreTopicWithFeedback, rankDiscoveryWithFeedback } from "./adaptiveEngine";
import type { DiscoveryItem, FeedPreferences } from "./types";

function createMockBlueprint(overrides: Partial<FeedPreferences> = {}) {
  const prefs: FeedPreferences = {
    interests: [
      { id: "ai", name: "Artificial Intelligence", strength: 85 },
      { id: "programming", name: "Programming", strength: 75 },
      { id: "design", name: "Design & UX", strength: 50 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials & How-To", strength: 90 },
      { id: "deep_dives", name: "Deep Dives & Essays", strength: 80 },
    ],
    filters: ["crypto"],
    ...overrides,
  };

  return generateSignalBlueprint(prefs);
}

test("scoreTopicWithFeedback returns boosted score for reinforced topic and reduced for cooling", () => {
  const blueprint = createMockBlueprint();

  let meta = createFeedbackMeta();
  meta = recordFeedback(meta, {
    actionId: "act-1",
    topicId: "ai",
    value: "MORE",
    trainingDay: 1,
  }).meta;

  meta = recordFeedback(meta, {
    actionId: "act-2",
    topicId: "design",
    value: "LESS",
    trainingDay: 1,
  }).meta;

  const adaptiveSignal = calculateDerivedSignal(blueprint, meta.items, {}, 1);

  const aiScore = scoreTopicWithFeedback("ai", adaptiveSignal);
  const designScore = scoreTopicWithFeedback("design", adaptiveSignal);
  const progScore = scoreTopicWithFeedback("programming", adaptiveSignal);

  // AI boosted (+10 delta + reinforced multiplier)
  assert.ok(aiScore > 85);
  // Design cooled (-10 delta + cooling multiplier)
  assert.ok(designScore < 50);
  // Programming untouched
  assert.equal(progScore, 75);
});

test("rankDiscoveryWithFeedback sorts boosted topic items ahead of cooled topic items", () => {
  const blueprint = createMockBlueprint({
    interests: [
      { id: "ai", name: "Artificial Intelligence", strength: 80 },
      { id: "design", name: "Design & UX", strength: 80 },
    ],
  });

  let meta = createFeedbackMeta();
  meta = recordFeedback(meta, {
    actionId: "act-1",
    topicId: "design",
    value: "MORE",
    trainingDay: 1,
  }).meta;

  meta = recordFeedback(meta, {
    actionId: "act-2",
    topicId: "ai",
    value: "LESS",
    trainingDay: 1,
  }).meta;

  const adaptiveSignal = calculateDerivedSignal(blueprint, meta.items, {}, 1);

  const items: DiscoveryItem[] = [
    {
      id: "item-ai",
      title: "AI Foundations",
      type: "search",
      stage: "core",
      relevance: 90,
      action: "Search",
      actionable: true,
      topicId: "ai",
      topicName: "Artificial Intelligence",
      reason: "Core AI",
      difficulty: "foundational",
    },
    {
      id: "item-design",
      title: "Design Principles",
      type: "search",
      stage: "core",
      relevance: 90,
      action: "Search",
      actionable: true,
      topicId: "design",
      topicName: "Design & UX",
      reason: "Design focus",
      difficulty: "foundational",
    },
  ];

  const ranked = rankDiscoveryWithFeedback(items, adaptiveSignal);
  assert.equal(ranked[0].topicId, "design");
  assert.equal(ranked[1].topicId, "ai");
});

test("training plan dynamically incorporates adaptive signal topic weights", () => {
  const blueprint = createMockBlueprint();

  let meta = createFeedbackMeta();
  // Boost design significantly
  meta = recordFeedback(meta, {
    actionId: "act-d1",
    topicId: "design",
    value: "MORE",
    trainingDay: 1,
  }).meta;
  meta = recordFeedback(meta, {
    actionId: "act-d2",
    topicId: "design",
    value: "USEFUL",
    trainingDay: 1,
  }).meta;

  const adaptiveSignal = calculateDerivedSignal(blueprint, meta.items, {}, 1);
  const plan = generateFeedTrainingPlan(blueprint, "instagram", adaptiveSignal);

  // Plan should generate valid days and actions
  assert.equal(plan.days.length, 7);
  const allActions = plan.days.flatMap(d => d.actions);
  const designActions = allActions.filter(a => "topic" in a && a.topic === "design");
  assert.ok(designActions.length > 0);
});

test("personalized discovery engine adapts search paths and crossover suggestions using feedback", () => {
  const blueprint = createMockBlueprint();

  let meta = createFeedbackMeta();
  meta = recordFeedback(meta, {
    actionId: "act-1",
    topicId: "programming",
    value: "MORE",
    trainingDay: 2,
  }).meta;

  const adaptiveSignal = calculateDerivedSignal(blueprint, meta.items, {}, 2);
  const plan = generateFeedTrainingPlan(blueprint, "instagram", adaptiveSignal);

  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 1,
    plan,
    adaptiveSignal,
  });

  assert.ok(discovery.searchPaths.length > 0);
  assert.ok(discovery.curatedCreators.length > 0);
  assert.ok(discovery.crossoverSuggestions.length > 0);
});
