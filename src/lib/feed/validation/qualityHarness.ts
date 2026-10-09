import type {
  FeedPreferences,
  SignalBlueprint,
  FeedTrainingPlan,
  DiscoveryFeed,
  TrainingAction,
  SearchTrainingAction,
  DiscoveryItem,
} from "../types";
import { generateSignalBlueprint } from "../blueprint";
import { generateFeedTrainingPlan } from "../training";
import { generatePersonalizedDiscovery } from "../discoveryEngine";
import { recordFeedback, createFeedbackMeta } from "../feedback";
import { calculateDerivedSignal } from "../adaptiveEngine";
import { DISCOVERY_TOPICS } from "../discoveryLibrary";
import { INTEREST_CREATOR_CATALOG } from "../interestData";
import {
  evaluateActionRelevance,
  evaluateDiscoveryItemRelevance,
  type RelevanceRelationship,
  type ItemRelevanceEvaluation,
} from "./relevanceEvaluator";
import type { TestPersona } from "./personas";

export interface PersonaHarnessReport {
  personaId: string;
  personaName: string;
  blueprint: SignalBlueprint;
  trainingPlan: FeedTrainingPlan;
  discoveryFeeds: DiscoveryFeed[];
  totalActions: number;
  actionCountsByType: Record<string, number>;
  relevanceDistribution: Record<RelevanceRelationship, number>;
  relevanceItems: ItemRelevanceEvaluation[];
  suppressionViolations: string[];
  searchQueries: string[];
  duplicateQueries: string[];
  interestActionDistribution: Record<string, number>;
  explanationValidationFailures: string[];
  metadataLimitations: string[];
}

export interface CatalogAuditReport {
  totalTopics: number;
  totalSubtopics: number;
  totalSearchQueries: number;
  totalCreators: number;
  duplicateTopicIds: string[];
  duplicateSubtopicIds: string[];
  duplicateSearchQueries: string[];
  duplicateCreatorIds: string[];
  missingFieldErrors: string[];
  invalidPlatforms: string[];
  malformedUrls: string[];
  topicsWithoutCreators: string[];
}

export interface AdaptiveBehaviorReport {
  baselineStrength: number;
  moreFeedbackStrength: number;
  lessFeedbackStrength: number;
  usefulFeedbackStrength: number;
  notUsefulFeedbackStrength: number;
  topicDeltaBounded: boolean;
  subtopicDeltaBounded: boolean;
  baseBlueprintImmutable: boolean;
  explanationReflectsFeedback: boolean;
  passed: boolean;
}

export interface DifferentiationReport {
  personaAId: string;
  personaBId: string;
  sharedTopics: string[];
  sharedQueries: string[];
  actionOverlapRatio: number;
  distinct: boolean;
}

/**
 * Checks explanation text for forbidden, misleading, or unsupported claims.
 */
export function validateExplanationText(explanation: string, profile: FeedPreferences): string | null {
  if (!explanation || explanation.trim().length === 0) {
    return "Explanation is empty.";
  }

  const lower = explanation.toLowerCase();

  // Reject unsupported algorithmic certainty claims
  const forbiddenPhrases = [
    "algorithm has changed",
    "algorithm changed",
    "guaranteed",
    "guarantee",
    "watched outside feedsmith",
    "platform has accepted",
    "platform accepted",
    "performed automatically",
    "automated action",
    "we hacked",
  ];

  for (const phrase of forbiddenPhrases) {
    if (lower.includes(phrase)) {
      return `Explanation contains forbidden claim: "${phrase}".`;
    }
  }

  // Must mention at least one relevant context or be general intent explanation
  const knownTerms = [
    ...(profile.interests ?? []).map(i => i.name.toLowerCase()),
    ...(profile.contentPreferences ?? []).map(cp => cp.name.toLowerCase()),
    "training",
    "signal",
    "engagement",
    "category",
    "categories",
    "suppress",
    "avoid",
    "focus",
    "objective",
  ];

  const hasContext = knownTerms.some(term => lower.includes(term));
  if (!hasContext) {
    return "Explanation does not reference user interests, content preferences, or intentional training.";
  }

  return null;
}

/**
 * Normalizes query string for duplicate checking.
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Runs complete harness evaluation on a single persona profile.
 */
export function runPersonaEvaluation(persona: TestPersona): PersonaHarnessReport {
  const blueprint = generateSignalBlueprint(persona.profile);
  const trainingPlan = generateFeedTrainingPlan(blueprint);

  const discoveryFeeds: DiscoveryFeed[] = [];
  for (let day = 0; day < 7; day++) {
    discoveryFeeds.push(
      generatePersonalizedDiscovery({
        blueprint,
        dayIndex: day,
      })
    );
  }

  const allActions: TrainingAction[] = trainingPlan.days.flatMap(d => d.actions);
  const allDiscoveryItems: DiscoveryItem[] = discoveryFeeds.flatMap(f => f.items);

  const actionCountsByType: Record<string, number> = {};
  for (const action of allActions) {
    actionCountsByType[action.type] = (actionCountsByType[action.type] ?? 0) + 1;
  }

  const relevanceDistribution: Record<RelevanceRelationship, number> = {
    direct_match: 0,
    related_topic: 0,
    weak_relationship: 0,
    unrelated: 0,
    conflicts_with_suppression: 0,
  };

  const relevanceItems: ItemRelevanceEvaluation[] = [];
  const suppressionViolations: string[] = [];
  const explanationValidationFailures: string[] = [];
  const metadataLimitationsSet = new Set<string>();

  // Evaluate training actions
  for (const action of allActions) {
    const evalResult = evaluateActionRelevance(action, persona.profile);
    relevanceItems.push(evalResult);
    relevanceDistribution[evalResult.relationship]++;

    if (evalResult.relationship === "conflicts_with_suppression") {
      suppressionViolations.push(`Action [${action.id}] "${action.title}": ${evalResult.reason}`);
    }

    if (evalResult.metadataLimitation) {
      metadataLimitationsSet.add(evalResult.metadataLimitation);
    }

    const whyError = validateExplanationText(action.why, persona.profile);
    if (whyError) {
      explanationValidationFailures.push(`Action [${action.id}] explanation: ${whyError}`);
    }
  }

  // Evaluate discovery items
  for (const item of allDiscoveryItems) {
    const evalResult = evaluateDiscoveryItemRelevance(item, persona.profile);
    relevanceItems.push(evalResult);
    relevanceDistribution[evalResult.relationship]++;

    if (evalResult.relationship === "conflicts_with_suppression") {
      suppressionViolations.push(`Discovery item [${item.id}] "${item.title}": ${evalResult.reason}`);
    }

    if (evalResult.metadataLimitation) {
      metadataLimitationsSet.add(evalResult.metadataLimitation);
    }

    const reasonError = validateExplanationText(item.reason, persona.profile);
    if (reasonError) {
      explanationValidationFailures.push(`Discovery item [${item.id}] explanation: ${reasonError}`);
    }
  }

  // Inspect search queries and detect duplicates
  const searchQueries: string[] = allActions
    .filter((a): a is SearchTrainingAction => a.type === "SEARCH")
    .map(a => a.query);

  const seenNormQueries = new Map<string, string>();
  const duplicateQueries: string[] = [];
  for (const q of searchQueries) {
    const norm = normalizeQuery(q);
    if (seenNormQueries.has(norm)) {
      duplicateQueries.push(`"${q}" duplicates earlier query "${seenNormQueries.get(norm)}"`);
    } else {
      seenNormQueries.set(norm, q);
    }
  }

  // Inspect interest distribution for actionable tasks
  const interestActionDistribution: Record<string, number> = {};
  for (const action of allActions) {
    if ("topic" in action && action.topic) {
      interestActionDistribution[action.topic] =
        (interestActionDistribution[action.topic] ?? 0) + 1;
    }
  }

  return {
    personaId: persona.id,
    personaName: persona.name,
    blueprint,
    trainingPlan,
    discoveryFeeds,
    totalActions: allActions.length,
    actionCountsByType,
    relevanceDistribution,
    relevanceItems,
    suppressionViolations,
    searchQueries,
    duplicateQueries,
    interestActionDistribution,
    explanationValidationFailures,
    metadataLimitations: Array.from(metadataLimitationsSet),
  };
}

/**
 * Audits the production discovery catalog and interest dataset for quality invariants.
 */
export function auditDiscoveryCatalog(): CatalogAuditReport {
  const topicKeys = Object.keys(DISCOVERY_TOPICS);
  const duplicateTopicIds: string[] = [];
  const duplicateSubtopicIds: string[] = [];
  const duplicateSearchQueries: string[] = [];
  const duplicateCreatorIds: string[] = [];
  const missingFieldErrors: string[] = [];
  const invalidPlatforms: string[] = [];
  const malformedUrls: string[] = [];
  const topicsWithoutCreators: string[] = [];

  const seenTopicIds = new Set<string>();
  const seenSubtopicIds = new Set<string>();
  const seenSearchQueries = new Set<string>();
  const seenCreatorIds = new Set<string>();

  let totalSubtopics = 0;
  let totalSearchQueries = 0;

  for (const topicId of topicKeys) {
    if (seenTopicIds.has(topicId)) duplicateTopicIds.push(topicId);
    seenTopicIds.add(topicId);

    const topic = DISCOVERY_TOPICS[topicId];
    if (!topic.name || topic.name.trim() === "") missingFieldErrors.push(`Topic ${topicId} missing name`);
    if (!topic.description || topic.description.trim() === "") missingFieldErrors.push(`Topic ${topicId} missing description`);

    // Subtopics
    for (const sub of topic.subtopics ?? []) {
      totalSubtopics++;
      if (seenSubtopicIds.has(sub.id)) duplicateSubtopicIds.push(`${topicId}:${sub.id}`);
      seenSubtopicIds.add(sub.id);
      if (!sub.name || sub.name.trim() === "") missingFieldErrors.push(`Subtopic ${topicId}:${sub.id} missing name`);
    }

    // Searches
    for (const search of topic.searches ?? []) {
      totalSearchQueries++;
      const normQuery = normalizeQuery(search.query);
      if (seenSearchQueries.has(normQuery)) duplicateSearchQueries.push(`${topicId}: "${search.query}"`);
      seenSearchQueries.add(normQuery);
      if (!search.query || search.query.trim() === "") missingFieldErrors.push(`Empty search query in topic ${topicId}`);
    }

    // Topic creators
    const creators = topic.creators ?? [];
    if (creators.length === 0) {
      topicsWithoutCreators.push(topicId);
    }

    for (const creator of creators) {
      if (seenCreatorIds.has(creator.id)) duplicateCreatorIds.push(creator.id);
      seenCreatorIds.add(creator.id);

      if (!creator.name || creator.name.trim() === "") missingFieldErrors.push(`Creator ${creator.id} missing name`);
      if (!["instagram", "youtube", "tiktok"].includes(creator.platform)) {
        invalidPlatforms.push(`${creator.id}: ${creator.platform}`);
      }
      if (creator.url) {
        try {
          new URL(creator.url);
        } catch {
          malformedUrls.push(`${creator.id}: ${creator.url}`);
        }
      }
    }
  }

  // Also audit INTEREST_CREATOR_CATALOG
  for (const c of INTEREST_CREATOR_CATALOG) {
    if (seenCreatorIds.has(c.id)) duplicateCreatorIds.push(`catalog:${c.id}`);
    seenCreatorIds.add(c.id);

    if (!c.name || c.name.trim() === "") missingFieldErrors.push(`Catalog creator ${c.id} missing name`);
    if (!["instagram", "youtube", "tiktok"].includes(c.platform)) {
      invalidPlatforms.push(`catalog:${c.id}: ${c.platform}`);
    }
    if (c.url) {
      try {
        new URL(c.url);
      } catch {
        malformedUrls.push(`catalog:${c.id}: ${c.url}`);
      }
    }
  }

  return {
    totalTopics: topicKeys.length,
    totalSubtopics,
    totalSearchQueries,
    totalCreators: seenCreatorIds.size,
    duplicateTopicIds,
    duplicateSubtopicIds,
    duplicateSearchQueries,
    duplicateCreatorIds,
    missingFieldErrors,
    invalidPlatforms,
    malformedUrls,
    topicsWithoutCreators,
  };
}

/**
 * Tests adaptive feedback behavior on a representative profile.
 */
export function testAdaptiveFeedbackBehavior(): AdaptiveBehaviorReport {
  const profile: FeedPreferences = {
    interests: [
      { id: "ai", name: "AI", strength: 80 },
      { id: "programming", name: "Programming", strength: 70 },
    ],
    contentPreferences: [{ id: "tutorials", name: "Tutorials", strength: 80 }],
  };

  const bp = generateSignalBlueprint(profile);
  const baselineStrength = bp.overallStrength;

  // Test MORE
  const moreMeta = createFeedbackMeta();
  const { meta: recordedMore } = recordFeedback(moreMeta, {
    actionId: "act-1",
    topicId: "ai",
    value: "MORE",
    trainingDay: 1,
  });
  const signalMore = calculateDerivedSignal(bp, recordedMore.items);
  const moreStrength = signalMore.topics["ai"]?.adjustedStrength ?? 0;

  // Test LESS
  const lessMeta = createFeedbackMeta();
  const { meta: recordedLess } = recordFeedback(lessMeta, {
    actionId: "act-2",
    topicId: "ai",
    value: "LESS",
    trainingDay: 1,
  });
  const signalLess = calculateDerivedSignal(bp, recordedLess.items);
  const lessStrength = signalLess.topics["ai"]?.adjustedStrength ?? 0;

  // Test USEFUL
  const usefulMeta = createFeedbackMeta();
  const { meta: recordedUseful } = recordFeedback(usefulMeta, {
    actionId: "act-3",
    topicId: "ai",
    value: "USEFUL",
    trainingDay: 1,
  });
  const signalUseful = calculateDerivedSignal(bp, recordedUseful.items);
  const usefulStrength = signalUseful.topics["ai"]?.adjustedStrength ?? 0;

  // Test NOT_USEFUL
  const notUsefulMeta = createFeedbackMeta();
  const { meta: recordedNotUseful } = recordFeedback(notUsefulMeta, {
    actionId: "act-4",
    topicId: "ai",
    value: "NOT_USEFUL",
    trainingDay: 1,
  });
  const signalNotUseful = calculateDerivedSignal(bp, recordedNotUseful.items);
  const notUsefulStrength = signalNotUseful.topics["ai"]?.adjustedStrength ?? 0;

  // Test bounded deltas under extreme feedback
  const extremeMeta = createFeedbackMeta();
  for (let i = 0; i < 20; i++) {
    extremeMeta.items.push({
      id: `fb-ext-${i}`,
      actionId: `act-ext-${i}`,
      topicId: "ai",
      subtopicId: "python",
      value: "MORE",
      trainingDay: 1,
      timestamp: new Date().toISOString(),
    });
  }
  const extremeSignal = calculateDerivedSignal(bp, extremeMeta.items);
  const topicDeltaBounded =
    extremeSignal.topics["ai"]?.delta <= 25 && extremeSignal.topics["ai"]?.delta >= -25;
  const subtopicDeltaBounded =
    (extremeSignal.subtopicDeltas["python"] ?? 0) <= 30 &&
    (extremeSignal.subtopicDeltas["python"] ?? 0) >= -30;

  // Verify base blueprint is not mutated
  const baseBlueprintImmutable =
    bp.primaryInterests[0].strength === 80 && bp.primaryInterests[1].strength === 70;

  const explanationReflectsFeedback = Boolean(
    signalMore.adaptationSummary?.includes("AI") ||
      signalMore.explanations.some(e => e.includes("AI"))
  );

  const passed =
    moreStrength > 80 &&
    lessStrength < 80 &&
    usefulStrength > 80 &&
    notUsefulStrength < 80 &&
    topicDeltaBounded &&
    subtopicDeltaBounded &&
    baseBlueprintImmutable &&
    explanationReflectsFeedback;

  return {
    baselineStrength,
    moreFeedbackStrength: moreStrength,
    lessFeedbackStrength: lessStrength,
    usefulFeedbackStrength: usefulStrength,
    notUsefulFeedbackStrength: notUsefulStrength,
    topicDeltaBounded,
    subtopicDeltaBounded,
    baseBlueprintImmutable,
    explanationReflectsFeedback,
    passed,
  };
}

/**
 * Tests differentiation between two distinct personas.
 */
export function testDifferentiation(
  personaA: TestPersona,
  personaB: TestPersona
): DifferentiationReport {
  const reportA = runPersonaEvaluation(personaA);
  const reportB = runPersonaEvaluation(personaB);

  const topicsA = new Set(Object.keys(reportA.interestActionDistribution));
  const topicsB = new Set(Object.keys(reportB.interestActionDistribution));

  const sharedTopics = Array.from(topicsA).filter(t => topicsB.has(t));

  const queriesA = new Set(reportA.searchQueries.map(normalizeQuery));
  const queriesB = new Set(reportB.searchQueries.map(normalizeQuery));
  const sharedQueries = Array.from(queriesA).filter(q => queriesB.has(q));

  const overlapRatio =
    (sharedTopics.length + sharedQueries.length) /
    (Math.max(1, topicsA.size + topicsB.size + queriesA.size + queriesB.size));

  return {
    personaAId: personaA.id,
    personaBId: personaB.id,
    sharedTopics,
    sharedQueries,
    actionOverlapRatio: Math.round(overlapRatio * 100) / 100,
    distinct: overlapRatio < 0.35,
  };
}
