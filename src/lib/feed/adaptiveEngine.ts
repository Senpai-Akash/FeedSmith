import {
  AdaptedSubtopicSignal,
  AdaptedTopicSignal,
  AdaptiveSignalState,
  DiscoveryItem,
  FeedTrainingPlan,
  FeedbackValue,
  SignalBlueprint,
  SignalJourneyEntry,
  SignalStatusLabel,
  UserFeedback,
} from "./types";
import { DailyHistory } from "./history";
import { DISCOVERY_TOPICS } from "./discoveryLibrary";

/**
 * Base adjustments for feedback values.
 */
export const FEEDBACK_WEIGHTS: Record<FeedbackValue, number> = {
  MORE: 12,
  USEFUL: 6,
  LESS: -10,
  NOT_USEFUL: -15,
};

/**
 * Bounds for adjustments.
 */
export const TOPIC_DELTA_MIN = -25;
export const TOPIC_DELTA_MAX = 25;
export const SUBTOPIC_DELTA_MIN = -30;
export const SUBTOPIC_DELTA_MAX = 30;
export const SIGNAL_STRENGTH_MIN = 5;
export const SIGNAL_STRENGTH_MAX = 100;

/**
 * Computes the time decay factor based on day difference.
 * Recent feedback has 1.0 influence; older feedback decays down to 0.40.
 */
export function calculateDecayFactor(feedbackDay: number, currentDay: number): number {
  const dayDiff = Math.max(0, currentDay - feedbackDay);
  return Math.max(0.4, 1.0 - dayDiff * 0.15);
}

/**
 * Computes effective weighted delta for a feedback item considering decay.
 */
export function computeEffectiveFeedbackDelta(
  feedback: UserFeedback,
  currentDay: number = feedback.trainingDay
): number {
  const baseWeight = FEEDBACK_WEIGHTS[feedback.value] ?? 0;
  const decay = calculateDecayFactor(feedback.trainingDay, currentDay);
  return Math.round(baseWeight * decay);
}

/**
 * Determines a semantic status label based on base strength, delta, and completions.
 */
export function computeStatusLabel(
  baseStrength: number,
  delta: number,
  completedActionCount: number = 0
): SignalStatusLabel {
  if (delta <= -5) {
    return "Refining";
  }
  if (delta >= 8) {
    return "Growing";
  }
  if (baseStrength >= 80 && (delta >= 0 || completedActionCount >= 2)) {
    return "Core";
  }
  if (baseStrength >= 70 && completedActionCount >= 1) {
    return "Established";
  }
  if (baseStrength >= 60 || delta >= 3) {
    return "Strong";
  }
  if (completedActionCount > 0 || delta > 0) {
    return "Emerging";
  }
  return "Strong";
}

/**
 * Derives subtopic status label.

/**
 * Generates an adaptive explanation string explaining how the plan adapted.
 */
export function generateAdaptationExplanation(
  state: AdaptiveSignalState,
  positiveSubtopics: string[],
  negativeSubtopics: string[]
): string | undefined {
  if (!state.hasAdaptations) return undefined;

  if (positiveSubtopics.length > 0 && negativeSubtopics.length > 0) {
    return `Your plan adapted: You've shown strong interest in ${positiveSubtopics[0]}, so future discovery deepens there while reducing ${negativeSubtopics[0]}.`;
  }

  if (positiveSubtopics.length > 0) {
    return `Your plan adapted: You've shown strong interest in ${positiveSubtopics.join(" & ")}, so today's discovery path goes deeper into those areas.`;
  }

  if (negativeSubtopics.length > 0) {
    return `Your plan adapted: We're reducing recommendations for ${negativeSubtopics.join(" & ")} based on your feedback.`;
  }

  return "Your preferences are shaping subsequent recommendations.";
}

/**
 * Calculates complete derived signal adjustments from blueprint, feedback, and completions.
 */
export function calculateDerivedSignal(
  blueprint: SignalBlueprint,
  feedbackList: UserFeedback[],
  completedActions: Record<string, boolean> = {},
  currentDay: number = 1
): AdaptiveSignalState {
  const allInterests = [
    ...blueprint.primaryInterests,
    ...blueprint.secondaryInterests,
  ];

  // Count completions per topic
  const completionsPerTopic: Record<string, number> = {};
  for (const [actionId, isComplete] of Object.entries(completedActions)) {
    if (!isComplete) continue;
    for (const interest of allInterests) {
      if (actionId.includes(interest.id)) {
        completionsPerTopic[interest.id] = (completionsPerTopic[interest.id] ?? 0) + 1;
      }
    }
  }

  // Aggregate subtopic feedback deltas and feedback counts
  const subtopicDeltas: Record<string, number> = {};
  const subtopicFeedbackCounts: Record<string, number> = {};
  const topicFeedbackDeltas: Record<string, number> = {};

  for (const fb of feedbackList) {
    const effectiveDelta = computeEffectiveFeedbackDelta(fb, currentDay);

    // Topic level aggregation
    topicFeedbackDeltas[fb.topicId] = (topicFeedbackDeltas[fb.topicId] ?? 0) + effectiveDelta;

    // Subtopic level aggregation if present
    if (fb.subtopicId) {
      subtopicDeltas[fb.subtopicId] = (subtopicDeltas[fb.subtopicId] ?? 0) + effectiveDelta;
      subtopicFeedbackCounts[fb.subtopicId] =
        (subtopicFeedbackCounts[fb.subtopicId] ?? 0) + 1;
    }
  }

  // Clamp subtopic deltas
  for (const [subId, delta] of Object.entries(subtopicDeltas)) {
    subtopicDeltas[subId] = Math.max(
      SUBTOPIC_DELTA_MIN,
      Math.min(SUBTOPIC_DELTA_MAX, delta)
    );
  }

  const positiveSubtopics: string[] = [];
  const negativeSubtopics: string[] = [];

  // Build adapted topic signals
  const topics: Record<string, AdaptedTopicSignal> = {};

  for (const interest of allInterests) {
    const topicId = interest.id;
    const baseStrength = interest.strength;
    const rawTopicDelta = topicFeedbackDeltas[topicId] ?? 0;
    const completionBonus = Math.min(10, (completionsPerTopic[topicId] ?? 0) * 2);

    const boundedDelta = Math.max(
      TOPIC_DELTA_MIN,
      Math.min(TOPIC_DELTA_MAX, rawTopicDelta + completionBonus)
    );

    const adjustedStrength = Math.max(
      SIGNAL_STRENGTH_MIN,
      Math.min(SIGNAL_STRENGTH_MAX, baseStrength + boundedDelta)
    );

    const statusLabel = computeStatusLabel(
      baseStrength,
      boundedDelta,
      completionsPerTopic[topicId] ?? 0
    );

    // Collect subtopic signals for this topic
    const topicCatalog = DISCOVERY_TOPICS[topicId];
    const subtopics: AdaptedSubtopicSignal[] = [];

    if (topicCatalog?.subtopics) {
      for (const st of topicCatalog.subtopics) {
        const stDelta = subtopicDeltas[st.id] ?? 0;
        const stCount = subtopicFeedbackCounts[st.id] ?? 0;

        if (stDelta >= 6) {
          positiveSubtopics.push(st.name);
        } else if (stDelta <= -6) {
          negativeSubtopics.push(st.name);
        }

        if (stDelta !== 0 || stCount > 0) {
          subtopics.push({
            id: st.id,
            name: st.name,
            delta: stDelta,
            feedbackCount: stCount,
            statusLabel: computeSubtopicStatusLabel(stDelta, stCount),
          });
        }
      }
    }

    topics[topicId] = {
      id: topicId,
      name: interest.name,
      baseStrength,
      adjustedStrength,
      delta: boundedDelta,
      statusLabel,
      subtopics: subtopics.sort((a, b) => b.delta - a.delta),
    };
  }

  // Calculate overall strength
  const topicValues = Object.values(topics);
  const overallStrength =
    topicValues.length > 0
      ? Math.round(
          topicValues.reduce((sum, t) => sum + t.adjustedStrength, 0) /
            topicValues.length
        )
      : blueprint.overallStrength;

  const hasAdaptations = feedbackList.length > 0;

  // Build granular explanations
  const explanations: string[] = [];
  for (const topic of topicValues) {
    if (topic.delta > 0) {
      explanations.push(`Increased focus on ${topic.name} (+${topic.delta} signal points).`);
    } else if (topic.delta < 0) {
      explanations.push(`Reduced emphasis on ${topic.name} (${topic.delta} signal points) based on feedback.`);
    }
  }

  for (const subName of [...new Set(positiveSubtopics)]) {
    explanations.push(`Deepening subtopic discovery in "${subName}".`);
  }
  for (const subName of [...new Set(negativeSubtopics)]) {
    explanations.push(`Dialing back suggestions related to "${subName}".`);
  }

  const state: AdaptiveSignalState = {
    topics,
    subtopicDeltas,
    overallStrength,
    feedbackCount: feedbackList.length,
    hasAdaptations,
    explanations,
  };

  state.adaptationSummary = generateAdaptationExplanation(
    state,
    [...new Set(positiveSubtopics)],
    [...new Set(negativeSubtopics)]
  );

  return state;
}

/**
 * Computes an effective numerical score for a topic accounting for feedback deltas.
 */
export function scoreTopicWithFeedback(
  topicId: string,
  adaptiveSignal?: AdaptiveSignalState
): number {
  if (!adaptiveSignal) return 50;
  const topic = adaptiveSignal.topics[topicId];
  if (!topic) return 50;
  return topic.adjustedStrength;
}

/**
 * Sorts discovery items deterministically by effective adaptive score.
 */
export function rankDiscoveryWithFeedback(
  items: DiscoveryItem[],
  adaptiveSignal?: AdaptiveSignalState
): DiscoveryItem[] {
  if (!adaptiveSignal) return [...items];

  return [...items].sort((a, b) => {
    const scoreA =
      scoreTopicWithFeedback(a.topicId, adaptiveSignal) +
      (adaptiveSignal.subtopicDeltas[a.subtopicId ?? ""] ?? 0);
    const scoreB =
      scoreTopicWithFeedback(b.topicId, adaptiveSignal) +
      (adaptiveSignal.subtopicDeltas[b.subtopicId ?? ""] ?? 0);
    return scoreB - scoreA;
  });
}

/**
 * Explores subtopics balancing exploitation (topics with strong positive feedback)
 * and exploration (semantically related subtopics the user has not yet given feedback on).
 */
export function getExplorationAndExploitationSubtopics(
  topicId: string,
  subtopicDeltas: Record<string, number>,
  limit: number = 4
): { exploit: string[]; explore: string[] } {
  const topicCatalog = DISCOVERY_TOPICS[topicId];
  if (!topicCatalog?.subtopics) {
    return { exploit: [], explore: [] };
  }

  const subtopics = topicCatalog.subtopics;
  const exploited: string[] = [];
  const unexplored: string[] = [];

  for (const st of subtopics) {
    const delta = subtopicDeltas[st.id] ?? 0;
    if (delta > 0) {
      exploited.push(st.id);
    } else if (delta === 0) {
      unexplored.push(st.id);
    }
  }

  return {
    exploit: exploited.slice(0, Math.ceil(limit / 2)),
    explore: unexplored.slice(0, Math.floor(limit / 2)),
  };
}

/**
 * Builds a deterministic Signal Journey timeline from actual training plan, history, and feedback.
 */
export function buildSignalJourney(
  plan: FeedTrainingPlan,
  history: DailyHistory[],
  feedbackList: UserFeedback[],
  blueprint: SignalBlueprint
): SignalJourneyEntry[] {
  const entries: SignalJourneyEntry[] = [];
  const primaryName = blueprint.primaryInterests[0]?.name ?? "Primary Topics";
  const secondaryName =
    blueprint.primaryInterests[1]?.name ?? blueprint.secondaryInterests[0]?.name;

  for (let d = 0; d < plan.days.length; d++) {
    const dayNumber = d + 1;
    const planDay = plan.days[d];
    const dailyHist = history.find(h => h.day === dayNumber);
    const dayFeedbacks = feedbackList.filter(f => f.trainingDay === dayNumber);

    const isCompleted = dailyHist?.completed ?? false;
    const completedActions = dailyHist?.completedActions ?? 0;

    if (dayNumber === 1) {
      entries.push({
        day: 1,
        stage: planDay.stage,
        title: `${primaryName} signal established`,
        description: isCompleted
          ? `Completed initial foundation baseline with ${completedActions} actions.`
          : `Establishing initial core signals around ${primaryName}${
              secondaryName ? ` and ${secondaryName}` : ""
            }.`,
        highlightTopic: primaryName,
        type: "established",
        timestamp: dailyHist?.completedAt,
      });
      continue;
    }

    if (dayNumber === 2) {
      entries.push({
        day: 2,
        stage: planDay.stage,
        title: `${primaryName} signal reinforced`,
        description: isCompleted
          ? `Reinforced key search patterns and intentional engagement.`
          : `Consolidating core topic clarity through focused searches.`,
        highlightTopic: primaryName,
        type: "reinforced",
        timestamp: dailyHist?.completedAt,
      });
      continue;
    }

    // Days 3 to 7: Check if user provided feedback on specific subtopics
    const positiveFeedback = dayFeedbacks.find(
      f => f.value === "MORE" || f.value === "USEFUL"
    );
    const negativeFeedback = dayFeedbacks.find(
      f => f.value === "LESS" || f.value === "NOT_USEFUL"
    );

    if (positiveFeedback) {
      const topicName =
        positiveFeedback.subtopicName || positiveFeedback.topicName || primaryName;
      entries.push({
        day: dayNumber,
        stage: planDay.stage,
        title: `${topicName} discovered & strengthened`,
        description: `Adapted future path with higher emphasis on ${topicName}.`,
        highlightTopic: positiveFeedback.topicId,
        highlightSubtopic: topicName,
        type: "adapted",
        timestamp: positiveFeedback.timestamp,
      });
    } else if (negativeFeedback) {
      const topicName =
        negativeFeedback.subtopicName || negativeFeedback.topicName || "Topic";
      entries.push({
        day: dayNumber,
        stage: planDay.stage,
        title: `${topicName} signal refined`,
        description: `Reduced subsequent recommendations for ${topicName} based on feedback.`,
        highlightTopic: negativeFeedback.topicId,
        highlightSubtopic: topicName,
        type: "refined",
        timestamp: negativeFeedback.timestamp,
      });
    } else {
      // Standard stage progression
      const stageTitles: Record<string, string> = {
        STRENGTHEN: `${primaryName} depth strengthened`,
        EXPAND: `Creator discovery & crossover expansion`,
        DEEPEN: `Specialized ${primaryName} deep dive`,
        REFINE: `Signal refinement & feed curation`,
        MAINTAIN: `Long-term signal maintenance`,
      };

      entries.push({
        day: dayNumber,
        stage: planDay.stage,
        title: stageTitles[planDay.stage] || `${planDay.stage} stage progression`,
        description: isCompleted
          ? `Completed ${completedActions} training actions.`
          : planDay.goal,
        highlightTopic: primaryName,
        type: isCompleted ? "discovered" : "strengthened",
        timestamp: dailyHist?.completedAt,
      });
    }
  }

  return entries;
}

/**
 * Computes subtopic status label.
 */
export function computeSubtopicStatusLabel(
  delta: number,
  feedbackCount: number
): SignalStatusLabel {
  if (delta <= -5) return "Refining";
  if (delta >= 8) return "Growing";
  if (delta > 0) return "Emerging";
  if (feedbackCount > 0) return "Explored";
  return "Established";
}
