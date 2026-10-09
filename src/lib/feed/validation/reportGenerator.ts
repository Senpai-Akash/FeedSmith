import {
  ALL_TEST_PERSONAS,
  PERSONA_A,
  PERSONA_B,
  PERSONA_C,
  PERSONA_D,
} from "./personas";
import {
  runPersonaEvaluation,
  auditDiscoveryCatalog,
  testAdaptiveFeedbackBehavior,
  testDifferentiation,
  type PersonaHarnessReport,
  type CatalogAuditReport,
  type AdaptiveBehaviorReport,
} from "./qualityHarness";

export interface CompleteEvaluationRun {
  timestamp: string;
  totalProfilesEvaluated: number;
  totalPlansGenerated: number;
  totalDiscoveryFeedsGenerated: number;
  personaReports: PersonaHarnessReport[];
  catalogAudit: CatalogAuditReport;
  adaptiveReport: AdaptiveBehaviorReport;
  differentiationReports: Array<{
    pair: string;
    actionOverlapRatio: number;
    distinct: boolean;
  }>;
}

/**
 * Runs the entire quality and validation lab suite across all personas and subsystems.
 */
export function runCompleteEvaluation(): CompleteEvaluationRun {
  const timestamp = new Date().toISOString();
  const personaReports = ALL_TEST_PERSONAS.map(p => runPersonaEvaluation(p));
  const catalogAudit = auditDiscoveryCatalog();
  const adaptiveReport = testAdaptiveFeedbackBehavior();

  const diffPairs = [
    { a: PERSONA_A, b: PERSONA_D, label: "Persona A (Software) vs Persona D (Animals & Photography)" },
    { a: PERSONA_B, b: PERSONA_C, label: "Persona B (Fitness) vs Persona C (Gaming)" },
    { a: PERSONA_A, b: PERSONA_B, label: "Persona A (Software) vs Persona B (Fitness)" },
  ];

  const differentiationReports = diffPairs.map(pair => {
    const diff = testDifferentiation(pair.a, pair.b);
    return {
      pair: pair.label,
      actionOverlapRatio: diff.actionOverlapRatio,
      distinct: diff.distinct,
    };
  });

  return {
    timestamp,
    totalProfilesEvaluated: ALL_TEST_PERSONAS.length,
    totalPlansGenerated: personaReports.length,
    totalDiscoveryFeedsGenerated: personaReports.length * 7,
    personaReports,
    catalogAudit,
    adaptiveReport,
    differentiationReports,
  };
}

/**
 * Formats evaluation results into a detailed Markdown report.
 */
export function formatEvaluationReportMarkdown(run: CompleteEvaluationRun): string {
  const lines: string[] = [];

  lines.push("# FEEDSMITH — RECOMMENDATION QUALITY & VALIDATION LAB REPORT");
  lines.push(`Generated: ${run.timestamp}`);
  lines.push("");
  lines.push("## 1. Executive Summary");
  lines.push("");
  lines.push(`- **Profiles Evaluated:** ${run.totalProfilesEvaluated} synthetic test personas (A through H)`);
  lines.push(`- **7-Day Training Plans Generated:** ${run.totalPlansGenerated}`);
  lines.push(`- **Discovery Feeds Generated:** ${run.totalDiscoveryFeedsGenerated} (7 days per persona)`);
  lines.push(`- **ML / AI Dependency:** None (100% deterministic, rule-based recommendation logic)`);
  lines.push("");

  // Aggregate metrics
  let totalDirectMatch = 0;
  let totalRelatedTopic = 0;
  let totalWeakRel = 0;
  let totalUnrelated = 0;
  let totalSuppressionConflicts = 0;
  let totalDuplicateQueries = 0;
  let totalExplanationFailures = 0;
  const allSuppressionViolations: string[] = [];
  const allDuplicateQueriesList: string[] = [];
  const allExplanationFailuresList: string[] = [];
  const allMetadataLimitations = new Set<string>();

  for (const report of run.personaReports) {
    totalDirectMatch += report.relevanceDistribution.direct_match;
    totalRelatedTopic += report.relevanceDistribution.related_topic;
    totalWeakRel += report.relevanceDistribution.weak_relationship;
    totalUnrelated += report.relevanceDistribution.unrelated;
    totalSuppressionConflicts += report.relevanceDistribution.conflicts_with_suppression;
    totalDuplicateQueries += report.duplicateQueries.length;
    totalExplanationFailures += report.explanationValidationFailures.length;

    report.suppressionViolations.forEach(v => allSuppressionViolations.push(`${report.personaName}: ${v}`));
    report.duplicateQueries.forEach(d => allDuplicateQueriesList.push(`${report.personaName}: ${d}`));
    report.explanationValidationFailures.forEach(e => allExplanationFailuresList.push(`${report.personaName}: ${e}`));
    report.metadataLimitations.forEach(m => allMetadataLimitations.add(m));
  }

  const totalRecommendations = totalDirectMatch + totalRelatedTopic + totalWeakRel + totalUnrelated + totalSuppressionConflicts;

  lines.push("## 2. Topic Relevance Distribution");
  lines.push("");
  lines.push("| Relationship Category | Count | Percentage |");
  lines.push("| :--- | :--- | :--- |");
  lines.push(`| Direct Match | ${totalDirectMatch} | ${totalRecommendations > 0 ? ((totalDirectMatch / totalRecommendations) * 100).toFixed(1) : 0}% |`);
  lines.push(`| Related Topic | ${totalRelatedTopic} | ${totalRecommendations > 0 ? ((totalRelatedTopic / totalRecommendations) * 100).toFixed(1) : 0}% |`);
  lines.push(`| Weak Relationship | ${totalWeakRel} | ${totalRecommendations > 0 ? ((totalWeakRel / totalRecommendations) * 100).toFixed(1) : 0}% |`);
  lines.push(`| Unrelated | ${totalUnrelated} | ${totalRecommendations > 0 ? ((totalUnrelated / totalRecommendations) * 100).toFixed(1) : 0}% |`);
  lines.push(`| Conflicts with Suppression | ${totalSuppressionConflicts} | ${totalRecommendations > 0 ? ((totalSuppressionConflicts / totalRecommendations) * 100).toFixed(1) : 0}% |`);
  lines.push(`| **Total Items Evaluated** | **${totalRecommendations}** | **100.0%** |`);
  lines.push("");

  lines.push("## 3. Suppression & Filtering Quality");
  lines.push("");
  lines.push(`- **Suppression Conflicts Detected:** ${totalSuppressionConflicts}`);
  if (allSuppressionViolations.length === 0) {
    lines.push("- **Result:** PASS. Suppressed categories are strictly excluded from positive recommendations.");
  } else {
    lines.push("- **Violations Details:**");
    allSuppressionViolations.forEach(v => lines.push(`  - ${v}`));
  }
  lines.push("");

  lines.push("## 4. Search Query Quality");
  lines.push("");
  lines.push(`- **Total Duplicate Search Queries Across Week:** ${totalDuplicateQueries}`);
  if (allDuplicateQueriesList.length === 0) {
    lines.push("- **Result:** PASS. No duplicate search queries generated across training days.");
  } else {
    lines.push("- **Detected Query Repetitions:**");
    allDuplicateQueriesList.slice(0, 10).forEach(d => lines.push(`  - ${d}`));
    if (allDuplicateQueriesList.length > 10) {
      lines.push(`  - ... and ${allDuplicateQueriesList.length - 10} more`);
    }
  }
  lines.push("");

  lines.push("## 5. Explanation Validation");
  lines.push("");
  lines.push(`- **Validation Failures:** ${totalExplanationFailures}`);
  if (allExplanationFailuresList.length === 0) {
    lines.push("- **Result:** PASS. All explanations are grounded in user profile inputs without unsupported algorithmic claims.");
  } else {
    lines.push("- **Failure Details:**");
    allExplanationFailuresList.forEach(e => lines.push(`  - ${e}`));
  }
  lines.push("");

  lines.push("## 6. Discovery Catalog Audit");
  lines.push("");
  lines.push(`- **Total Catalog Topics:** ${run.catalogAudit.totalTopics}`);
  lines.push(`- **Total Subtopics:** ${run.catalogAudit.totalSubtopics}`);
  lines.push(`- **Total Curated Searches:** ${run.catalogAudit.totalSearchQueries}`);
  lines.push(`- **Total Curated Creators:** ${run.catalogAudit.totalCreators}`);
  lines.push(`- **Duplicate Topic IDs:** ${run.catalogAudit.duplicateTopicIds.length}`);
  lines.push(`- **Duplicate Subtopic IDs:** ${run.catalogAudit.duplicateSubtopicIds.length}`);
  lines.push(`- **Duplicate Search Queries:** ${run.catalogAudit.duplicateSearchQueries.length}`);
  lines.push(`- **Missing Required Fields:** ${run.catalogAudit.missingFieldErrors.length}`);
  lines.push(`- **Invalid Platforms:** ${run.catalogAudit.invalidPlatforms.length}`);
  lines.push(`- **Malformed URLs:** ${run.catalogAudit.malformedUrls.length}`);
  lines.push(`- **Topics Without Creators in Catalog:** ${run.catalogAudit.topicsWithoutCreators.join(", ") || "None"}`);
  lines.push("");

  lines.push("## 7. Adaptive Feedback Engine Invariants");
  lines.push("");
  lines.push(`- **MORE feedback increases strength:** ${run.adaptiveReport.moreFeedbackStrength > run.adaptiveReport.baselineStrength ? "PASS" : "FAIL"}`);
  lines.push(`- **LESS feedback decreases strength:** ${run.adaptiveReport.lessFeedbackStrength < run.adaptiveReport.baselineStrength ? "PASS" : "FAIL"}`);
  lines.push(`- **USEFUL feedback increases strength:** ${run.adaptiveReport.usefulFeedbackStrength > run.adaptiveReport.baselineStrength ? "PASS" : "FAIL"}`);
  lines.push(`- **NOT_USEFUL feedback decreases strength:** ${run.adaptiveReport.notUsefulFeedbackStrength < run.adaptiveReport.baselineStrength ? "PASS" : "FAIL"}`);
  lines.push(`- **Adjustments Bounded [-25, +25]:** ${run.adaptiveReport.topicDeltaBounded ? "PASS" : "FAIL"}`);
  lines.push(`- **Subtopic Deltas Bounded [-30, +30]:** ${run.adaptiveReport.subtopicDeltaBounded ? "PASS" : "FAIL"}`);
  lines.push(`- **Base Blueprint Immutability:** ${run.adaptiveReport.baseBlueprintImmutable ? "PASS" : "FAIL"}`);
  lines.push(`- **Adaptive Explanation Correspondence:** ${run.adaptiveReport.explanationReflectsFeedback ? "PASS" : "FAIL"}`);
  lines.push("");

  lines.push("## 8. Differentiation Across Personas");
  lines.push("");
  run.differentiationReports.forEach(diff => {
    lines.push(`- **${diff.pair}:** Overlap Ratio = ${(diff.actionOverlapRatio * 100).toFixed(1)}% (${diff.distinct ? "DISTINCT" : "OVERLAPPING"})`);
  });
  lines.push("");

  lines.push("## 9. Catalog Metadata Limitations");
  lines.push("");
  if (allMetadataLimitations.size === 0) {
    lines.push("- All evaluated topics have complete metadata coverage in DISCOVERY_TOPICS.");
  } else {
    lines.push("- The following limitation(s) were recorded for custom/unindexed topics:");
    Array.from(allMetadataLimitations).forEach(m => lines.push(`  - ${m}`));
  }
  lines.push("");

  lines.push("## 10. Per-Persona Breakdown");
  lines.push("");
  for (const report of run.personaReports) {
    lines.push(`### ${report.personaName} (${report.personaId})`);
    lines.push(`- **Total Actions:** ${report.totalActions}`);
    lines.push(`- **Direct Match / Related Items:** ${report.relevanceDistribution.direct_match + report.relevanceDistribution.related_topic} / ${report.relevanceItems.length}`);
    lines.push(`- **Action Counts by Type:** ${Object.entries(report.actionCountsByType).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
    lines.push(`- **Topic Distribution in Actions:** ${Object.entries(report.interestActionDistribution).map(([k, v]) => `${k}: ${v}`).join(", ") || "None"}`);
    lines.push(`- **Duplicate Queries:** ${report.duplicateQueries.length}`);
    lines.push(`- **Suppression Violations:** ${report.suppressionViolations.length}`);
    lines.push("");
  }

  return lines.join("\n");
}
