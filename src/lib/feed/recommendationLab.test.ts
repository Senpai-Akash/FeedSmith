import assert from "node:assert/strict";
import test from "node:test";

import {
  PERSONA_A,
  PERSONA_B,
  PERSONA_C,
  PERSONA_D,
  PERSONA_E,
  PERSONA_F,
  PERSONA_G,
  PERSONA_H,
  ALL_TEST_PERSONAS,
} from "./validation/personas";
import {
  runPersonaEvaluation,
  testAdaptiveFeedbackBehavior,
  testDifferentiation,
  validateExplanationText,
} from "./validation/qualityHarness";
import { generateSignalBlueprint } from "./blueprint";
import { generateFeedTrainingPlan } from "./training";

test("QUALITY INVARIANT: Relevance - recommendations relate to selected profile interests", () => {
  for (const persona of [PERSONA_A, PERSONA_B, PERSONA_C, PERSONA_D, PERSONA_E, PERSONA_F]) {
    const report = runPersonaEvaluation(persona);
    assert.equal(
      report.relevanceDistribution.conflicts_with_suppression,
      0,
      `Persona ${persona.id} should have zero suppression conflicts`
    );
    assert.equal(
      report.relevanceDistribution.unrelated,
      0,
      `Persona ${persona.id} should have zero unrelated recommendations`
    );
    assert.ok(
      report.relevanceDistribution.direct_match > 0,
      `Persona ${persona.id} should have direct match recommendations`
    );
  }
});

test("QUALITY INVARIANT: Priority - strong interests receive more or equal attention than weaker interests", () => {
  // Test Persona A (Software: AI=90, Programming=85, Linux=70)
  const reportA = runPersonaEvaluation(PERSONA_A);
  const aiActions = reportA.interestActionDistribution["ai"] ?? 0;
  const progActions = reportA.interestActionDistribution["programming"] ?? 0;
  const linuxActions = reportA.interestActionDistribution["linux"] ?? 0;

  assert.ok(aiActions >= progActions, "AI (90) actions should be >= Programming (85) actions");
  assert.ok(progActions >= linuxActions, "Programming (85) actions should be >= Linux (70) actions");

  // Test Persona F (Many Interests: AI=95, Programming=90, Gaming=65, Fitness=50, Music=35, Photography=20)
  const reportF = runPersonaEvaluation(PERSONA_F);
  const aiF = reportF.interestActionDistribution["ai"] ?? 0;
  const progF = reportF.interestActionDistribution["programming"] ?? 0;
  const photoF = reportF.interestActionDistribution["photography"] ?? 0;

  assert.ok(aiF >= progF, "AI (95) should receive >= actions than Programming (90)");
  assert.ok(progF > photoF, "Programming (90) should receive strictly more actions than Photography (20)");
});

test("QUALITY INVARIANT: Suppression - suppressed categories are never actively recommended", () => {
  for (const persona of ALL_TEST_PERSONAS) {
    const report = runPersonaEvaluation(persona);
    assert.equal(
      report.suppressionViolations.length,
      0,
      `Persona ${persona.id} had unexpected suppression violations: ${report.suppressionViolations.join("; ")}`
    );
  }

  // Specifically verify Persona G with conflicting preferences (Cats interest, but Cats also suppressed)
  const reportG = runPersonaEvaluation(PERSONA_G);
  assert.equal(reportG.suppressionViolations.length, 0, "Conflicting interest must be suppressed cleanly");
  assert.equal(
    reportG.interestActionDistribution["cats"] ?? 0,
    0,
    "Suppressed 'cats' must not receive active training actions"
  );
  assert.ok(
    (reportG.interestActionDistribution["gaming"] ?? 0) > 0,
    "Non-suppressed 'gaming' should be retained and trained"
  );
});

test("QUALITY INVARIANT: Diversity & Progression - 7-day plan progresses across documented stages", () => {
  const reportA = runPersonaEvaluation(PERSONA_A);
  const expectedStages = [
    "ESTABLISH",
    "REINFORCE",
    "STRENGTHEN",
    "EXPAND",
    "DEEPEN",
    "REFINE",
    "MAINTAIN",
  ];

  const actualStages = reportA.trainingPlan.days.map(d => d.stage);
  assert.deepEqual(actualStages, expectedStages, "Stages must follow 7-day progression");

  // Single interest persona should not invent unselected variety
  const reportE = runPersonaEvaluation(PERSONA_E);
  const distinctTopicsInActions = Object.keys(reportE.interestActionDistribution);
  assert.deepEqual(distinctTopicsInActions, ["ai"], "Single interest persona must only train chosen interest");
});

test("QUALITY INVARIANT: Consistency - equivalent inputs produce identical outputs deterministically", () => {
  const plan1 = generateFeedTrainingPlan(generateSignalBlueprint(PERSONA_A.profile));
  const plan2 = generateFeedTrainingPlan(generateSignalBlueprint(PERSONA_A.profile));

  assert.deepEqual(plan1, plan2, "Plan generation must be 100% deterministic and pure");
});

test("QUALITY INVARIANT: Explainability - explanations are supported by inputs and free of false claims", () => {
  for (const persona of ALL_TEST_PERSONAS) {
    const report = runPersonaEvaluation(persona);
    assert.equal(
      report.explanationValidationFailures.length,
      0,
      `Persona ${persona.id} had explanation failures: ${report.explanationValidationFailures.join("; ")}`
    );
  }

  // Test validator rejects unsupported marketing / algorithmic certainty claims
  assert.ok(
    validateExplanationText("The Instagram algorithm has changed to favor this.", PERSONA_A.profile),
    "Should reject claim that platform algorithm changed"
  );
  assert.ok(
    validateExplanationText("This recommendation is guaranteed to work.", PERSONA_A.profile),
    "Should reject guarantee claims"
  );
  assert.ok(
    validateExplanationText("This action was performed automatically.", PERSONA_A.profile),
    "Should reject claims of automated actions"
  );
});

test("QUALITY INVARIANT: Fallbacks - empty or partial profile degrades gracefully without crashing", () => {
  const reportH = runPersonaEvaluation(PERSONA_H);

  assert.equal(reportH.blueprint.primaryInterests.length, 0);
  assert.equal(reportH.blueprint.overallStrength, 0);
  assert.equal(reportH.totalActions, 7, "Empty profile should only have light daily engage actions");
  assert.equal(reportH.actionCountsByType["WATCH"] ?? 0, 0, "No watch actions fabricated");
  assert.equal(reportH.actionCountsByType["SEARCH"] ?? 0, 0, "No search actions fabricated");
  assert.equal(reportH.actionCountsByType["SUBSCRIBE"] ?? 0, 0, "No creator actions fabricated");
  assert.equal(reportH.suppressionViolations.length, 0);
});

test("QUALITY INVARIANT: Maintenance - Day 7 is lighter and does not restart initial cycle", () => {
  for (const persona of [PERSONA_A, PERSONA_B, PERSONA_C, PERSONA_D, PERSONA_F]) {
    const report = runPersonaEvaluation(persona);
    const day7 = report.trainingPlan.days[6];

    assert.equal(day7.stage, "MAINTAIN");
    // Day 7 should have 0 follow/subscribe creator actions
    const day7Creators = day7.actions.filter(a => a.type === "FOLLOW" || a.type === "SUBSCRIBE");
    assert.equal(day7Creators.length, 0, "Day 7 maintenance must not include follow actions");

    // Day 7 should have 0 avoid actions (focus is on natural maintenance)
    const day7Avoid = day7.actions.filter(a => a.type === "AVOID");
    assert.equal(day7Avoid.length, 0, "Day 7 maintenance must not include avoid actions");

    // Day 7 should have 1 search action (lighter than mid-week 2-3)
    const day7Search = day7.actions.filter(a => a.type === "SEARCH");
    assert.equal(day7Search.length, 1, "Day 7 maintenance should only have 1 light search action");
  }
});

test("QUALITY INVARIANT: Differentiation - distinct personas produce distinct plans", () => {
  const diffA_D = testDifferentiation(PERSONA_A, PERSONA_D);
  assert.ok(diffA_D.distinct, "Software Development vs Animals/Photography must be distinct");
  assert.equal(diffA_D.actionOverlapRatio, 0, "Zero topic and query overlap between software and cats/photo");

  const diffB_C = testDifferentiation(PERSONA_B, PERSONA_C);
  assert.ok(diffB_C.distinct, "Fitness vs Gaming must be distinct");

  const diffA_B = testDifferentiation(PERSONA_A, PERSONA_B);
  assert.ok(diffA_B.distinct, "Software vs Fitness must be distinct");
});

test("QUALITY INVARIANT: Adaptive Behavior - feedback predictably shifts signal within bounds", () => {
  const adaptiveTest = testAdaptiveFeedbackBehavior();
  assert.ok(adaptiveTest.passed, "Adaptive behavior invariants must pass");
  assert.ok(adaptiveTest.moreFeedbackStrength > adaptiveTest.baselineStrength);
  assert.ok(adaptiveTest.lessFeedbackStrength < adaptiveTest.baselineStrength);
  assert.ok(adaptiveTest.usefulFeedbackStrength > adaptiveTest.baselineStrength);
  assert.ok(adaptiveTest.notUsefulFeedbackStrength < adaptiveTest.baselineStrength);
  assert.ok(adaptiveTest.topicDeltaBounded);
  assert.ok(adaptiveTest.subtopicDeltaBounded);
  assert.ok(adaptiveTest.baseBlueprintImmutable);
});

