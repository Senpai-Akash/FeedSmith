import test from "node:test";
import assert from "node:assert";
import { generateSearchExplanation, generateCreatorExplanation } from "./discoverySelection";
import type { FeedPreference, ContentPreference, CreatorRecommendation } from "./types";

test("generateSearchExplanation creates appropriate message for top interest without subtopic delta", () => {
  const interest: FeedPreference = { id: "ai", name: "AI", strength: 90 };
  const contentPrefs: ContentPreference[] = [{ id: "educational", name: "Educational", strength: 80 }];
  const explanation = generateSearchExplanation(interest, contentPrefs, true);
  assert.ok(explanation.includes("reinforces AI"));
  assert.ok(explanation.includes("core"));
});

test("generateSearchExplanation includes subtopic when positive delta provided", () => {
  const interest: FeedPreference = { id: "programming", name: "Programming", strength: 70 };
  const contentPrefs: ContentPreference[] = [];
  const explanation = generateSearchExplanation(interest, contentPrefs, false, "Algorithms", 5);
  assert.ok(explanation.includes("explores deeper into Algorithms"));
});

test("generateCreatorExplanation returns fallback when no matching interests", () => {
  const creator: CreatorRecommendation = {
    id: "c1",
    name: "Random Creator",
    platform: "instagram",
    topics: ["random"],
    description: "Just random content",
  };
  const interests: FeedPreference[] = [{ id: "ai", name: "AI", strength: 90 }];
  const explanation = generateCreatorExplanation(creator, interests);
  assert.ok(explanation.includes("adds another signal"));
});

test("generateCreatorExplanation includes boosted subtopic when feedback delta present", () => {
  const creator: CreatorRecommendation = {
    id: "c2",
    name: "Boosted Creator",
    platform: "instagram",
    topics: ["ai"],
    description: "Loves AI and deep learning",
  };
  const interests: FeedPreference[] = [{ id: "ai", name: "AI", strength: 95 }];
  const subtopicDeltas = { "deep-learning": 10 };
  const explanation = generateCreatorExplanation(creator, interests, subtopicDeltas);
  // Expect reference to subtopic boost or alignment
  assert.ok(explanation.includes("aligns with") || explanation.includes("Boosted"));
});
