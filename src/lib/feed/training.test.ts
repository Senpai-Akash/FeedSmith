import assert from "node:assert/strict";
import test from "node:test";

import { generateSignalBlueprint } from "./blueprint";
import { calculatePlanProgress, generateFeedTrainingPlan, normalizeCompletedActions } from "./training";
import { selectSearchQuery } from "./discoverySelection";
import type { TrainingAction } from "./types";

const contentPreferences = [
  { id: "tutorials", name: "Tutorials", strength: 90 },
  { id: "educational", name: "Educational", strength: 75 },
];

function buildPrefs(interests: Array<{ id: string; name: string; strength: number }>) {
  return {
    interests,
    contentPreferences,
    filters: ["celebrity"],
  };
}

test("AI and fitness plans prioritize different interests and actions", () => {
  const aiPlan = generateFeedTrainingPlan(
    generateSignalBlueprint(
      buildPrefs([
        { id: "ai", name: "AI", strength: 95 },
        { id: "programming", name: "Programming", strength: 88 },
        { id: "science", name: "Science", strength: 52 },
      ])
    )
  );

  const fitnessPlan = generateFeedTrainingPlan(
    generateSignalBlueprint(
      buildPrefs([
        { id: "fitness", name: "Fitness", strength: 94 },
        { id: "nutrition", name: "Nutrition", strength: 82 },
        { id: "running", name: "Running", strength: 60 },
      ])
    )
  );

  const aiTopics = new Set(
    aiPlan.days[0].actions.flatMap((action: TrainingAction) => (
      "topicName" in action && typeof action.topicName === "string" ? [action.topicName] : []
    ))
  );
  const fitnessTopics = new Set(
    fitnessPlan.days[0].actions.flatMap((action: TrainingAction) => (
      "topicName" in action && typeof action.topicName === "string" ? [action.topicName] : []
    ))
  );

  assert.ok(aiTopics.has("AI") || aiTopics.has("Programming"));
  assert.ok(fitnessTopics.has("Fitness") || fitnessTopics.has("Nutrition"));
  assert.notDeepEqual([...aiTopics].sort(), [...fitnessTopics].sort());
});

test("search queries progress from broad to sharper, topic-specific queries over the week", () => {
  const interest = { id: "programming", name: "Programming", strength: 90 };

  const dayOne = selectSearchQuery(interest, 0, contentPreferences);
  const dayThree = selectSearchQuery(interest, 2, contentPreferences);
  const dayFive = selectSearchQuery(interest, 4, contentPreferences);
  const daySeven = selectSearchQuery(interest, 6, contentPreferences);

  assert.ok(dayOne.length > 0);
  assert.notEqual(dayOne, dayThree);
  assert.notEqual(dayThree, dayFive);
  assert.notEqual(dayFive, daySeven);
  assert.ok(
    dayThree.toLowerCase().includes("programming") ||
      dayThree.toLowerCase().includes("python") ||
      dayThree.toLowerCase().includes("react") ||
      dayThree.toLowerCase().includes("javascript") ||
      dayThree.toLowerCase().includes("data structures")
  );
  assert.ok(
    dayFive.toLowerCase().includes("python") ||
      dayFive.toLowerCase().includes("react") ||
      dayFive.toLowerCase().includes("deep") ||
      dayFive.toLowerCase().includes("architecture") ||
      dayFive.toLowerCase().includes("async")
  );
});

test("plan progress counts real completions and ignores duplicate entries", () => {
  const plan = generateFeedTrainingPlan(
    generateSignalBlueprint(
      buildPrefs([
        { id: "programming", name: "Programming", strength: 84 },
      ])
    )
  );

  const actionId = plan.days[0].actions[0].id;
  const completed = normalizeCompletedActions({
    [actionId]: true,
    [actionId]: true,
    [plan.days[1].actions[0].id]: true,
  });

  const progress = calculatePlanProgress(plan, completed);
  assert.equal(progress.completedCount, 2);
  assert.equal(progress.totalActions, plan.days.reduce((sum: number, day: { actions: Array<{ id: string }> }) => sum + day.actions.length, 0));
  assert.ok(progress.progressPercent >= 0);
});
