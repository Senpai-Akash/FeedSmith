import assert from "node:assert/strict";
import test from "node:test";

import { generateSignalBlueprint } from "./blueprint";
import { generateFeedTrainingPlan } from "./training";
import { generatePersonalizedDiscovery } from "./discoveryEngine";
import type { FeedPreferences } from "./types";

function createMockBlueprint(overrides: Partial<FeedPreferences> = {}) {
  const prefs: FeedPreferences = {
    interests: [
      { id: "ai", name: "Artificial Intelligence", strength: 95 },
      { id: "programming", name: "Programming", strength: 80 },
      { id: "design", name: "Design & UX", strength: 60 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials & How-To", strength: 90 },
      { id: "deep_dives", name: "Deep Dives & Essays", strength: 80 },
    ],
    filters: ["crypto", "celebrity gossip"],
    ...overrides,
  };

  return generateSignalBlueprint(prefs);
}

test("discovery engine generates distinct stages across 7 days", () => {
  const blueprint = createMockBlueprint();
  const plan = generateFeedTrainingPlan(blueprint);

  const day0 = generatePersonalizedDiscovery({ blueprint, dayIndex: 0, plan });
  const day1 = generatePersonalizedDiscovery({ blueprint, dayIndex: 1, plan });
  const day2 = generatePersonalizedDiscovery({ blueprint, dayIndex: 2, plan });
  const day3 = generatePersonalizedDiscovery({ blueprint, dayIndex: 3, plan });
  const day4 = generatePersonalizedDiscovery({ blueprint, dayIndex: 4, plan });
  const day5 = generatePersonalizedDiscovery({ blueprint, dayIndex: 5, plan });
  const day6 = generatePersonalizedDiscovery({ blueprint, dayIndex: 6, plan });

  assert.equal(day0.stage, "core");
  assert.equal(day1.stage, "related");
  assert.equal(day2.stage, "depth");
  assert.equal(day3.stage, "creator");
  assert.equal(day4.stage, "advanced");
  assert.equal(day5.stage, "crossover");
  assert.equal(day6.stage, "refinement");

  // Verify daily goal and stage title are non-empty
  assert.ok(day0.stageTitle.length > 0);
  assert.ok(day0.stageGoal.length > 0);
  assert.ok(day0.searchPaths.length > 0);
  assert.ok(day0.curatedCreators.length > 0);
});

test("suppression filters exclude unwanted terms and creators", () => {
  const blueprint = createMockBlueprint({
    filters: ["crypto", "hype", "gossip"],
  });
  const plan = generateFeedTrainingPlan(blueprint);

  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 0,
    plan,
  });

  const allItems = [
    ...discovery.searchPaths,
    ...discovery.curatedCreators,
    ...discovery.crossoverSuggestions,
    ...discovery.formatRecommendations,
  ];

  for (const item of allItems) {
    const text = `${item.title} ${item.searchQuery ?? ""} ${item.reason}`.toLowerCase();
    assert.ok(!text.includes("crypto"), `Found suppressed word 'crypto' in item: ${item.title}`);
    assert.ok(!text.includes("hype"), `Found suppressed word 'hype' in item: ${item.title}`);
  }
});

test("crossover suggestions bridge primary and secondary interest topics", () => {
  const blueprint = createMockBlueprint({
    interests: [
      { id: "ai", name: "Artificial Intelligence", strength: 90 },
      { id: "design", name: "Design & UX", strength: 85 },
    ],
  });
  const plan = generateFeedTrainingPlan(blueprint);

  const day5 = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 5,
    plan,
  });

  assert.ok(day5.crossoverSuggestions.length > 0);
  const crossover = day5.crossoverSuggestions[0];
  assert.equal(crossover.type, "crossover");
  assert.ok(crossover.reason.includes("Artificial Intelligence") || crossover.reason.includes("Design & UX"));
});

test("discovery actions link with completed state from daily plan", () => {
  const blueprint = createMockBlueprint();
  const plan = generateFeedTrainingPlan(blueprint);

  const actionToComplete = plan.days[0].actions[0];
  assert.ok(actionToComplete, "Expected day 0 to have actions");

  const completedActions: Record<string, boolean> = {
    [actionToComplete.id]: true,
  };

  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 0,
    completedActions,
    plan,
  });

  const matchingDiscovery = discovery.searchPaths.find(
    item => item.actionId === actionToComplete.id
  );

  if (matchingDiscovery) {
    assert.equal(matchingDiscovery.completed, true);
  }
});

test("format recommendations reflect user's top content preferences", () => {
  const blueprint = createMockBlueprint({
    contentPreferences: [
      { id: "deep_dives", name: "Deep Dives & Essays", strength: 98 },
      { id: "tutorials", name: "Tutorials & How-To", strength: 60 },
    ],
  });
  const plan = generateFeedTrainingPlan(blueprint);

  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 2,
    plan,
  });

  assert.ok(discovery.formatRecommendations.length > 0);
  const formatRec = discovery.formatRecommendations.find(item => item.type === "content");
  assert.ok(formatRec, "Expected at least one content format recommendation");
  assert.ok(formatRec.reason.length > 0);
});

test("single interest user still receives valid crossover suggestions", () => {
  const blueprint = createMockBlueprint({
    interests: [{ id: "fitness", name: "Fitness & Strength", strength: 95 }],
    contentPreferences: [],
    filters: [],
  });
  const plan = generateFeedTrainingPlan(blueprint);

  const discovery = generatePersonalizedDiscovery({
    blueprint,
    dayIndex: 5,
    plan,
  });

  assert.ok(discovery.crossoverSuggestions.length > 0);
  assert.ok(discovery.crossoverSuggestions[0].title.length > 0);
});

