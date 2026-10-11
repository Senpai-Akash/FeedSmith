import assert from "node:assert/strict";
import test from "node:test";

import { DISCOVERY_TOPICS } from "./discoveryLibrary";
import { generateSignalBlueprint } from "./blueprint";
import { generateFeedTrainingPlan } from "./training";
import { generatePersonalizedDiscovery } from "./discoveryEngine";
import type { FeedPreferences } from "./types";

test("discovery catalog integrity: 0 duplicate topic IDs, 0 duplicate subtopic IDs, 0 duplicate search queries", () => {
  const topicIds = new Set<string>();
  const subtopicIds = new Set<string>();
  const searchQueries = new Set<string>();

  for (const topic of Object.values(DISCOVERY_TOPICS)) {
    assert.ok(!topicIds.has(topic.id), `Duplicate topic ID found: ${topic.id}`);
    topicIds.add(topic.id);

    assert.ok(topic.subtopics.length > 0, `Topic ${topic.id} has no subtopics`);
    for (const sub of topic.subtopics) {
      assert.ok(!subtopicIds.has(sub.id), `Duplicate subtopic ID found: ${sub.id} in topic ${topic.id}`);
      subtopicIds.add(sub.id);
      assert.ok(sub.name.length > 0, `Subtopic ${sub.id} has empty name`);
      if (sub.description) {
        assert.ok(sub.description.length > 0, `Subtopic ${sub.id} has empty description`);
      }
      if (sub.keywords) {
        assert.ok(sub.keywords.length > 0, `Subtopic ${sub.id} has empty keywords array`);
      }
    }

    assert.ok(topic.searches.length > 0, `Topic ${topic.id} has no search queries`);
    for (const sq of topic.searches) {
      const qLower = sq.query.toLowerCase().trim();
      assert.ok(!searchQueries.has(qLower), `Duplicate search query across catalog: "${sq.query}"`);
      searchQueries.add(qLower);
      assert.equal(sq.provenance ?? "curated", "curated", `Expected search query provenance to be curated: ${sq.query}`);
    }
  }

  assert.ok(topicIds.size >= 23, `Expected at least 23 topics, found ${topicIds.size}`);
  assert.ok(subtopicIds.size >= 90, `Expected at least 90 subtopics, found ${subtopicIds.size}`);
  assert.ok(searchQueries.size >= 230, `Expected at least 230 search queries, found ${searchQueries.size}`);
});

test("structured intelligence fields are fully populated on discovery items", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 90 },
      { id: "photography", name: "Photography", strength: 75 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials & How-To", strength: 85 },
      { id: "reviews", name: "Reviews & Breakdowns", strength: 70 },
    ],
    filters: ["clickbait"],
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint);

  const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 0, plan });

  assert.ok(discovery.searchPaths.length > 0);
  for (const item of discovery.searchPaths) {
    assert.ok(item.whatToExplore && item.whatToExplore.length > 0, "Missing whatToExplore");
    assert.ok(item.whatToSearch && item.whatToSearch.length > 0, "Missing whatToSearch");
    assert.ok(item.whatToLookFor && item.whatToLookFor.length > 0, "Missing whatToLookFor");
    assert.ok(item.whySuggested && item.whySuggested.length > 0, "Missing whySuggested");
    assert.ok(item.whatToDoNext && item.whatToDoNext.length > 0, "Missing whatToDoNext");
    assert.equal(item.provenance, "curated");
  }
});

test("creator discovery: never fabricates fake creators, uses creator guidance fallback with concrete criteria", () => {
  // Topic with no curated creators in catalog: 'linux'
  const prefs: FeedPreferences = {
    interests: [{ id: "linux", name: "Linux & Systems", strength: 95 }],
    contentPreferences: [],
    filters: [],
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint);
  const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 3, plan });

  assert.ok(discovery.curatedCreators.length > 0, "Expected creator recommendations");
  const creatorItem = discovery.curatedCreators[0];

  // Must be creator guidance, not a hallucinated creator name
  assert.equal(creatorItem.provenance, "creator_guidance");
  assert.ok(creatorItem.whatToLookFor && creatorItem.whatToLookFor.length > 0);
  assert.ok(creatorItem.whatToSearch && creatorItem.whatToSearch.length > 0);
  assert.ok(
    creatorItem.title.startsWith("Search for") ||
      creatorItem.title.startsWith("Find") ||
      creatorItem.title.startsWith("Look for"),
    `Expected guidance title to be actionable instruction, got: "${creatorItem.title}"`
  );
  // Check that no fabricated follower counts or handles exist
  assert.equal(creatorItem.creator?.handle, undefined);
});

test("creator discovery: preserves curated creators with provenance and verification status", () => {
  // Topic with curated creators: 'ai'
  const prefs: FeedPreferences = {
    interests: [{ id: "ai", name: "Artificial Intelligence", strength: 95 }],
    contentPreferences: [],
    filters: [],
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint);
  const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 3, plan });

  assert.ok(discovery.curatedCreators.length > 0);
  const curatedItem = discovery.curatedCreators.find(c => c.provenance === "curated");
  assert.ok(curatedItem, "Expected at least one curated creator item");
  assert.equal(curatedItem.creator?.verificationStatus, "curated");
});

test("content format mapping generates tailored guidance for all 5 major formats", () => {
  const formats = ["tutorials", "educational", "entertainment", "reviews", "discussions"];

  for (const formatId of formats) {
    const prefs: FeedPreferences = {
      interests: [{ id: "programming", name: "Programming", strength: 90 }],
      contentPreferences: [{ id: formatId, name: formatId, strength: 90 }],
      filters: [],
    };

    const blueprint = generateSignalBlueprint(prefs);
    const plan = generateFeedTrainingPlan(blueprint);
    const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 2, plan });

    const formatItem = discovery.formatRecommendations.find(f => f.type === "content");
    assert.ok(formatItem, `Expected format recommendation for format: ${formatId}`);
    assert.equal(formatItem.provenance, "generated_query");
    assert.ok(formatItem.whatToLookFor && formatItem.whatToLookFor.length > 0);
    assert.ok(formatItem.whatToDoNext && formatItem.whatToDoNext.length > 0);
  }
});

test("crossover recommendations generate high-signal query intersections between topics", () => {
  const prefs: FeedPreferences = {
    interests: [
      { id: "programming", name: "Programming", strength: 90 },
      { id: "ai", name: "Artificial Intelligence", strength: 80 },
    ],
    contentPreferences: [],
    filters: [],
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint);
  const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 5, plan });

  assert.ok(discovery.crossoverSuggestions.length > 0);
  const crossover = discovery.crossoverSuggestions[0];
  assert.equal(crossover.provenance, "generated_query");
  assert.ok(crossover.searchQuery && crossover.searchQuery.length > 0);
  assert.ok(crossover.whatToSearch && crossover.whatToSearch.length > 0);
  assert.ok(crossover.whatToLookFor && crossover.whatToLookFor.length > 0);
});

test("graceful degradation on empty or minimal profile", () => {
  const prefs: FeedPreferences = {
    interests: [],
    contentPreferences: [],
    filters: [],
  };

  const blueprint = generateSignalBlueprint(prefs);
  const plan = generateFeedTrainingPlan(blueprint);
  const discovery = generatePersonalizedDiscovery({ blueprint, dayIndex: 0, plan });

  // Fallback defaults should be generated cleanly without crashes
  assert.ok(discovery.stageTitle.length > 0);
  assert.ok(discovery.stageGoal.length > 0);
  assert.ok(Array.isArray(discovery.searchPaths));
  assert.ok(Array.isArray(discovery.curatedCreators));
  assert.ok(Array.isArray(discovery.crossoverSuggestions));
  assert.ok(Array.isArray(discovery.formatRecommendations));
});
