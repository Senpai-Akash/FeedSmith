import assert from "node:assert/strict";
import test from "node:test";

import { generateSignalBlueprint } from "./blueprint";
import {
  recordFeedback,
  removeFeedback,
  getFeedbackForAction,
  createFeedbackMeta,
  calculateDerivedSignal,
  buildSignalJourney,
} from "./feedback";
import { generateFeedTrainingPlan } from "./training";
import type { FeedPreferences } from "./types";

function buildSampleBlueprint(): ReturnType<typeof generateSignalBlueprint> {
  const prefs: FeedPreferences = {
    interests: [
      { id: "ai", name: "Artificial Intelligence", strength: 80 },
      { id: "fitness", name: "Fitness & Strength", strength: 70 },
      { id: "design", name: "Design & UX", strength: 50 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials & How-To", strength: 90 },
      { id: "deep_dives", name: "Deep Dives", strength: 80 },
    ],
    filters: ["crypto"],
  };

  return generateSignalBlueprint(prefs);
}

test("recordFeedback adds and updates feedback items deterministically", () => {
  let meta = createFeedbackMeta();

  // Add more feedback for AI
  const res1 = recordFeedback(meta, {
    actionId: "action-1",
    topicId: "ai",
    topicName: "Artificial Intelligence",
    value: "MORE",
    trainingDay: 1,
  });
  meta = res1.meta;

  assert.equal(meta.items.length, 1);
  assert.equal(meta.items[0].value, "MORE");
  assert.equal(meta.items[0].topicId, "ai");

  const retrieved = getFeedbackForAction(meta, "action-1");
  assert.ok(retrieved);
  assert.equal(retrieved?.value, "MORE");

  // Update existing action feedback to less
  const res2 = recordFeedback(meta, {
    actionId: "action-1",
    topicId: "ai",
    value: "LESS",
    trainingDay: 2,
  });
  meta = res2.meta;

  assert.equal(meta.items.length, 1);
  assert.equal(meta.items[0].value, "LESS");

  // Add feedback for another action
  const res3 = recordFeedback(meta, {
    actionId: "action-2",
    topicId: "fitness",
    value: "USEFUL",
    trainingDay: 2,
  });
  meta = res3.meta;
  assert.equal(meta.items.length, 2);

  // Remove feedback
  meta = removeFeedback(meta, "action-1");
  assert.equal(meta.items.length, 1);
  assert.equal(meta.items[0].actionId, "action-2");
  assert.equal(getFeedbackForAction(meta, "action-1"), undefined);
});

test("calculateDerivedSignal shifts effective topic weights and overall strength without mutating blueprint", () => {
  const blueprint = buildSampleBlueprint();
  const baseAiStrength = blueprint.primaryInterests.find(t => t.id === "ai")?.strength ?? 80;

  // Record positive feedback for AI and negative for Fitness
  let meta = createFeedbackMeta();
  meta = recordFeedback(meta, {
    actionId: "act-ai-1",
    topicId: "ai",
    topicName: "Artificial Intelligence",
    value: "MORE",
    trainingDay: 1,
  }).meta;

  meta = recordFeedback(meta, {
    actionId: "act-fit-1",
    topicId: "fitness",
    topicName: "Fitness & Strength",
    value: "LESS",
    trainingDay: 1,
  }).meta;

  const derived = calculateDerivedSignal(blueprint, meta.items, {}, 1);

  const derivedAi = derived.topics["ai"];
  const derivedFitness = derived.topics["fitness"];

  assert.ok(derivedAi);
  assert.ok(derivedFitness);

  // AI should have increased weight
  assert.ok(derivedAi.adjustedStrength > baseAiStrength);
  assert.equal(derivedAi.delta, 12);
  assert.equal(derivedAi.statusLabel, "Growing");

  // Fitness should have decreased weight
  assert.ok(derivedFitness.adjustedStrength < 70);
  assert.equal(derivedFitness.delta, -10);

  // Base blueprint object must remain untouched
  assert.equal(blueprint.primaryInterests.find(t => t.id === "ai")?.strength, baseAiStrength);

  // Explanations should reflect both feedback actions
  assert.ok(derived.explanations.length >= 2);
  assert.ok(derived.explanations.some(e => e.includes("Artificial Intelligence")));
  assert.ok(derived.explanations.some(e => e.includes("Fitness & Strength")));
});

test("calculateDerivedSignal applies completion bonus and status classification", () => {
  const blueprint = buildSampleBlueprint();
  const plan = generateFeedTrainingPlan(blueprint);

  // Mark all AI actions on day 1 as completed
  const day1AiActions = plan.days[0].actions.filter(a => "topic" in a && a.topic === "ai");
  const completed: Record<string, boolean> = {};
  for (const a of day1AiActions) {
    completed[a.id] = true;
  }

  const derived = calculateDerivedSignal(blueprint, [], completed, 1);
  const derivedAi = derived.topics["ai"];

  assert.ok(derivedAi);
  assert.ok(derivedAi.delta > 0);
  assert.ok(derivedAi.adjustedStrength > derivedAi.baseStrength);
});

test("buildSignalJourney creates complete 7-day progression history with feedback metrics", () => {
  const blueprint = buildSampleBlueprint();
  const plan = generateFeedTrainingPlan(blueprint);

  let meta = createFeedbackMeta();
  meta = recordFeedback(meta, {
    actionId: "act-1",
    topicId: "ai",
    value: "MORE",
    trainingDay: 1,
  }).meta;

  const dailyHistory = plan.days.map((day, idx) => ({
    day: day.day,
    stage: day.stage,
    totalActions: day.actions.length,
    completedActions: idx === 0 ? day.actions.length : 0,
    completed: idx === 0,
    date: `2026-09-2${idx + 1}`,
  }));

  const journey = buildSignalJourney(plan, dailyHistory, meta.items, blueprint);

  assert.equal(journey.length, 7);
  assert.equal(journey[0].day, 1);
  assert.equal(journey[0].type, "established");
  assert.ok(journey[0].title.length > 0);
  assert.ok(journey[0].description.length > 0);
  assert.ok(journey[0].highlightTopic);
});


