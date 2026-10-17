import test from "node:test";
import assert from "node:assert/strict";

import {
  TEST_PERSONAS,
  evaluateRecommendationQuality,
  evaluateInterestRelevance,
  evaluateInterestFairShare,
  evaluateSuppressionSafety,
  evaluateQueryDiversity,
  evaluateProgressionSequencing,
  evaluateExplanationHonesty,
} from "./recommendationQuality";

import { generateFeedTrainingPlan } from "./training";
import { generateSignalBlueprint } from "./blueprint";

test("QUALITY HARNESS: all 10 representative test personas are well-formed", () => {
  const personas = Object.values(TEST_PERSONAS);
  assert.equal(personas.length, 10);

  for (const p of personas) {
    assert.ok(p.id, "Persona must have an ID");
    assert.ok(p.name, "Persona must have a name");
    assert.ok(p.description, "Persona must have a description");
    assert.ok(p.preferences.interests.length > 0, "Persona must have at least one interest");
    assert.ok(p.preferences.platform, "Persona must have a platform");
  }
});

test("QUALITY HARNESS: single interest specialist receives deep focused plan without crashing", () => {
  const persona = TEST_PERSONAS.single_interest_specialist;
  const report = evaluateRecommendationQuality(persona.preferences);

  assert.equal(report.totalDays, 7);
  assert.ok(report.totalActions >= 14, "Expected at least 2 actions per day");
  assert.equal(report.metrics.suppressionSafety.passed, true);
  assert.equal(report.metrics.progressionSequencing.passed, true);
  assert.equal(report.metrics.explanationHonesty.passed, true);
});

test("QUALITY HARNESS: strict suppression profile does not violate negative constraints", () => {
  const persona = TEST_PERSONAS.strict_suppression_profile;
  const bp = generateSignalBlueprint(persona.preferences);
  const plan = generateFeedTrainingPlan(bp, persona.preferences.platform).days;
  const suppression = evaluateSuppressionSafety(plan, persona.preferences);

  assert.equal(suppression.passed, true);
  assert.equal(suppression.score, 1.0);
});

test("QUALITY HARNESS: progression sequence matches 7 documented stages", () => {
  const persona = TEST_PERSONAS.dual_core_balanced;
  const bp = generateSignalBlueprint(persona.preferences);
  const plan = generateFeedTrainingPlan(bp, persona.preferences.platform).days;
  const progression = evaluateProgressionSequencing(plan);

  assert.equal(progression.passed, true);
  assert.equal(progression.score, 1.0);
});

test("QUALITY HARNESS: explanations are honest and free of false algorithm claims", () => {
  const persona = TEST_PERSONAS.broad_multi_interest;
  const bp = generateSignalBlueprint(persona.preferences);
  const plan = generateFeedTrainingPlan(bp, persona.preferences.platform).days;
  const honesty = evaluateExplanationHonesty(plan);

  assert.equal(honesty.passed, true);
  assert.equal(honesty.score, 1.0);
});
