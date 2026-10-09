import assert from "node:assert/strict";
import test from "node:test";

import { DISCOVERY_TOPICS } from "./discoveryLibrary";
import { INTEREST_CREATOR_CATALOG, INTERESTS, INTEREST_SEARCH_SUGGESTIONS } from "./interestData";
import { auditDiscoveryCatalog } from "./validation/qualityHarness";

test("CATALOG QUALITY: Discovery topics and subtopics have complete, valid metadata", () => {
  const audit = auditDiscoveryCatalog();

  assert.equal(audit.missingFieldErrors.length, 0, `Missing field errors: ${audit.missingFieldErrors.join("; ")}`);
  assert.equal(audit.duplicateTopicIds.length, 0, "No duplicate discovery topic IDs");
  assert.equal(audit.invalidPlatforms.length, 0, `Invalid platforms: ${audit.invalidPlatforms.join("; ")}`);
  assert.equal(audit.malformedUrls.length, 0, `Malformed URLs: ${audit.malformedUrls.join("; ")}`);
  assert.ok(audit.totalTopics >= 16, "Must define at least 16 core discovery topics");
  assert.ok(audit.totalSearchQueries >= 100, "Must define rich search queries across specificity levels");
});

test("CATALOG QUALITY: Search queries within each topic are distinct and non-empty", () => {
  for (const [topicId, topic] of Object.entries(DISCOVERY_TOPICS)) {
    const seenQueries = new Set<string>();
    for (const search of topic.searches) {
      assert.ok(search.query && search.query.trim().length > 0, `Query in ${topicId} cannot be empty`);
      assert.ok(
        ["broad", "specific", "discovery"].includes(search.specificity),
        `Query "${search.query}" in ${topicId} must have valid specificity`
      );
      const lower = search.query.toLowerCase().trim();
      assert.ok(
        !seenQueries.has(lower),
        `Topic "${topicId}" should not have duplicate internal search query: "${search.query}"`
      );
      seenQueries.add(lower);
    }
  }
});

test("CATALOG QUALITY: Curated creators have valid platform references and topic associations", () => {
  const allTopicIds = new Set(Object.keys(DISCOVERY_TOPICS));

  for (const creator of INTEREST_CREATOR_CATALOG) {
    assert.ok(creator.id, "Creator must have an ID");
    assert.ok(creator.name, "Creator must have a display name");
    assert.ok(creator.description, "Creator must have a description");
    assert.ok(
      ["instagram", "youtube", "tiktok"].includes(creator.platform),
      `Creator ${creator.id} has invalid platform: ${creator.platform}`
    );
    assert.ok(creator.topics.length > 0, `Creator ${creator.id} must be associated with at least one topic`);
    assert.ok(
      creator.topics.every(t => allTopicIds.has(t) || INTERESTS.some(i => i.id === t)),
      `Creator ${creator.id} references nonexistent topic: ${creator.topics.join(", ")}`
    );
    if (creator.url) {
      assert.doesNotThrow(() => new URL(creator.url), `Creator ${creator.id} has invalid URL format: ${creator.url}`);
    }
  }
});

test("CATALOG QUALITY: Interest search suggestions cover core topics with fallback queries", () => {
  for (const interest of INTERESTS) {
    const suggestions = INTEREST_SEARCH_SUGGESTIONS[interest.id];
    assert.ok(Array.isArray(suggestions), `Interest "${interest.id}" must have search suggestions`);
    assert.ok(suggestions.length >= 3, `Interest "${interest.id}" must have at least 3 fallback suggestions`);
    for (const suggestion of suggestions) {
      assert.ok(suggestion.length > 0, `Suggestion for "${interest.id}" cannot be empty`);
    }
  }
});

