import {
  ContentPreference,
  CreatorRecommendation,
  FeedPreference,
  FeedTrainingDay,
  FeedTrainingPlan,
  SignalBlueprint,
  TrainingAction,
  TrainingPlatform,
} from "./types";
import {
  INTEREST_CREATOR_CATALOG,
  INTEREST_SEARCH_SUGGESTIONS,
} from "./interestData";
import {
  selectSearchQuery,
  selectCreators,
  generateSearchExplanation,
  generateCreatorExplanation,
} from "./discoverySelection";

const DEFAULT_PLATFORM: TrainingPlatform = "instagram";

/**
 * Stage details for each day of the training plan.
 */
const STAGE_DETAILS: Pick<FeedTrainingDay, "day" | "stage" | "goal">[] = [
  {
    day: 1,
    stage: "ESTABLISH",
    goal: "Build an initial signal around your strongest interests.",
  },
  {
    day: 2,
    stage: "REINFORCE",
    goal: "Repeat the clearest signals so the platform has less ambiguity.",
  },
  {
    day: 3,
    stage: "STRENGTHEN",
    goal: "Add more specific searches and watch useful content fully when it earns your attention.",
  },
  {
    day: 4,
    stage: "EXPAND",
    goal: "Discover a few additional creators without drifting away from your chosen mix.",
  },
  {
    day: 5,
    stage: "DEEPEN",
    goal: "Lean into your strongest interest with higher-quality saves and focused watching.",
  },
  {
    day: 6,
    stage: "REFINE",
    goal: "Tighten the content mix and avoid reinforcing topics you do not want.",
  },
  {
    day: 7,
    stage: "MAINTAIN",
    goal: "Keep the strongest signals warm with a lighter, repeatable routine.",
  },
];

/**
 * Maps content preference IDs to human-readable labels for descriptions.
 */
const CONTENT_LANGUAGE: Record<string, string> = {
  educational: "educational",
  entertainment: "entertaining",
  news: "news-focused",
  tutorials: "tutorial",
  discussions: "discussion-led",
};

/**
 * Convert a string to a URL-safe slug for action IDs.
 */
function actionSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Get all interests from a blueprint, sorted by strength.
 */
function getAllInterests(blueprint: SignalBlueprint): FeedPreference[] {
  return [...blueprint.primaryInterests, ...blueprint.secondaryInterests]
    .filter(interest => interest.strength > 0)
    .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

/**
 * Get all content preferences from a blueprint, sorted by strength.
 */
function getContentPreferences(blueprint: SignalBlueprint): ContentPreference[] {
  return [...blueprint.contentPreferences]
    .filter(preference => preference.strength > 0)
    .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

/**
 * Get the human-readable label for a content preference.
 */
function contentLabel(preference: ContentPreference | undefined): string {
  if (!preference) return "relevant";
  return CONTENT_LANGUAGE[preference.id] ?? preference.name.toLowerCase();
}

/**
 * Calculate base watch targets for each day based on training intensity.
 * Takes into account the number of interests to scale appropriately.
 */
function calculateDailyWatchTargets(interestCount: number): number[] {
  // Base targets adjusted for different numbers of interests
  if (interestCount === 0) return [0, 0, 0, 0, 0, 0, 0];
  if (interestCount === 1) return [5, 4, 5, 4, 5, 3, 2];
  if (interestCount === 2) return [8, 7, 8, 7, 8, 6, 4];
  if (interestCount <= 4) return [11, 10, 12, 11, 12, 9, 6];
  if (interestCount <= 6) return [13, 12, 14, 13, 14, 10, 7];
  return [15, 14, 16, 15, 16, 12, 8]; // 7+ interests
}

/**
 * Allocate watch counts to interests based on their strength.
 * This ensures stronger interests get more content.
 *
 * Algorithm:
 * 1. Calculate each interest's proportional share
 * 2. Distribute remainders to highest-strength interests
 * 3. Ensure minimum of 1 per interest
 */
function allocateCounts(
  interests: FeedPreference[],
  total: number
): Record<string, number> {
  if (interests.length === 0 || total === 0) return {};

  const strengthTotal = interests.reduce(
    (sum, interest) => sum + interest.strength,
    0
  );
  if (strengthTotal === 0) return {};

  const allocations = interests.map(interest => {
    const exact = (interest.strength / strengthTotal) * total;
    return {
      id: interest.id,
      base: Math.max(1, Math.floor(exact)),
      remainder: exact - Math.floor(exact),
      strength: interest.strength,
    };
  });

  let assigned = allocations.reduce((sum, item) => sum + item.base, 0);
  const ordered = [...allocations].sort(
    (a, b) =>
      b.remainder - a.remainder ||
      b.strength - a.strength ||
      a.id.localeCompare(b.id)
  );

  // Distribute remaining budget to highest-priority interests
  while (assigned < total) {
    ordered[(assigned - allocations.length) % ordered.length].base += 1;
    assigned += 1;
  }

  // Remove excess if somehow we overallocated
  while (assigned > total && ordered.some(item => item.base > 1)) {
    const reducible = [...ordered].reverse().find(item => item.base > 1);
    if (!reducible) break;
    reducible.base -= 1;
    assigned -= 1;
  }

  return Object.fromEntries(allocations.map(item => [item.id, item.base]));
}

/**
 * Select a search query for an interest on a given day.
 *
 * Uses the Discovery Library to provide personalized search suggestions
 * based on user's content preferences and the training day stage.
 *
 * Falls back to generic suggestions if discovery data unavailable.
 */
function searchQueryFor(
  interest: FeedPreference,
  dayIndex: number,
  contentPreferences: ContentPreference[]
): string {
  // Try discovery-based selection first
  try {
    return selectSearchQuery(interest, dayIndex, contentPreferences);
  } catch {
    // Fallback to legacy suggestions
    const suggestions = INTEREST_SEARCH_SUGGESTIONS[interest.id] ?? [
      `${interest.name} tutorials`,
      `${interest.name} explained`,
      `${interest.name} creators`,
    ];

    // Broad stage (days 0-1)
    if (dayIndex < 2) {
      return suggestions[0] ?? `${interest.name}`;
    }

    // Specific stage (days 2-3)
    if (dayIndex < 4) {
      return suggestions[Math.min(1, suggestions.length - 1)] ?? suggestions[0];
    }

    // Discovery stage (days 4-5)
    if (dayIndex < 6) {
      return suggestions[Math.min(2, suggestions.length - 1)] ?? suggestions[0];
    }

    // Maintenance (day 6)
    return suggestions[0] ?? `${interest.name}`;
  }
}

/**
 * Get creators relevant to an interest.
 */
function creatorsFor(interest: FeedPreference): CreatorRecommendation[] {
  return INTEREST_CREATOR_CATALOG.filter(creator =>
    (creator.topics as readonly string[]).includes(interest.id)
  ).map(creator => ({
    ...creator,
    platform: creator.platform as TrainingPlatform,
    topics: [...creator.topics],
  }));
}

/**
 * Determine the action type for creators based on platform.
 */
function creatorActionType(platform: TrainingPlatform): "FOLLOW" | "SUBSCRIBE" {
  return platform === "youtube" ? "SUBSCRIBE" : "FOLLOW";
}

/**
 * Build WATCH actions for a day.
 * Allocates watch counts based on interest strength.
 */
function buildWatchActions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  dayIndex: number
): TrainingAction[] {
  const dailyTargets = calculateDailyWatchTargets(interests.length);
  const counts = allocateCounts(interests, dailyTargets[dayIndex]);

  return interests.map((interest, index) => {
    const preferenceCount = Math.max(contentPreferences.length, 1);
    const contentPreference = contentPreferences[(dayIndex + index) % preferenceCount];
    const style = contentLabel(contentPreference);
    const contentPreferenceName = contentPreference?.name ?? "Relevant";
    const count = counts[interest.id] ?? 1;

    return {
      id: `day-${dayIndex + 1}-watch-${interest.id}`,
      type: "WATCH" as const,
      title: `Watch ${count} ${interest.name} ${count === 1 ? "video" : "videos"}`,
      topic: interest.id,
      topicName: interest.name,
      count,
      contentType: contentPreference?.id ?? "relevant",
      contentPreferenceName,
      platform: DEFAULT_PLATFORM,
      description: `Watch ${count} ${style} ${interest.name.toLowerCase()} ${count === 1 ? "video" : "videos"}.`,
      why: `This reinforces ${interest.name} at ${interest.strength}/100 in a way that matches your ${contentPreferenceName.toLowerCase()} preference without overloading weaker signals.`,
    };
  });
}

/**
 * Build SEARCH actions for a day.
 * Uses the Discovery Library to provide personalized search suggestions
 * and explanations based on user interests and content preferences.
 */
function buildSearchActions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  dayIndex: number
): TrainingAction[] {
  // Vary search count by day
  let searchCount: number;
  if (dayIndex === 0 || dayIndex === 6) searchCount = 1; // Days 1 & 7: light
  else if (dayIndex === 2 || dayIndex === 4) searchCount = 3; // Days 3 & 5: high
  else searchCount = 2; // Days 2, 4, 6: moderate

  searchCount = Math.min(searchCount, interests.length);

  return interests.slice(0, searchCount).map((interest, index) => {
    const query = searchQueryFor(interest, dayIndex, contentPreferences);
    const isTopInterest = index === 0;
    const explanation = generateSearchExplanation(interest, contentPreferences, isTopInterest);

    return {
      id: `day-${dayIndex + 1}-search-${actionSlug(query)}`,
      type: "SEARCH" as const,
      title: `Search "${query}"`,
      topic: interest.id,
      topicName: interest.name,
      query,
      platform: DEFAULT_PLATFORM,
      description: `Search "${query}" and choose results that genuinely match what you want more of.`,
      why: explanation,
    };
  });
}

/**
 * Build FOLLOW/SUBSCRIBE actions for a day.
 *
 * Uses the Discovery Library to select relevant creators based on:
 * - User's strongest interests
 * - Content match quality
 * - Day-specific recommendations
 *
 * Day strategy:
 * Day 1 (ESTABLISH): Discover 1-2 creators from strongest topics
 * Days 2-3: Follow the strongest matches
 * Day 4 (EXPAND): Explore 2-3 creators
 * Day 5 (DEEPEN): Focus on strongest topic, 1-2 creators
 * Day 6 (REFINE): Light refinement, 1 creator
 * Day 7 (MAINTAIN): Maintenance, no new follows
 */
function buildCreatorActions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  dayIndex: number
): TrainingAction[] {
  // Skip days where we don't recommend creators
  if (![0, 1, 2, 3, 4, 5].includes(dayIndex)) return [];

  // Determine which interests to use and how many creator recommendations
  let targetInterests: FeedPreference[];
  let maxCreators: number;

  if (dayIndex === 0) {
    // Day 1: Top 2 interests, 1-2 creators total
    targetInterests = interests.slice(0, Math.min(2, interests.length));
    maxCreators = 2;
  } else if (dayIndex === 1 || dayIndex === 2) {
    // Days 2-3: Top 2 interests, 1-2 creators total
    targetInterests = interests.slice(0, Math.min(2, interests.length));
    maxCreators = 2;
  } else if (dayIndex === 3) {
    // Day 4: Top 3 interests, 2-3 creators total
    targetInterests = interests.slice(0, Math.min(3, interests.length));
    maxCreators = 3;
  } else if (dayIndex === 4) {
    // Day 5: Top 2 interests, 2 creators total
    targetInterests = interests.slice(0, Math.min(2, interests.length));
    maxCreators = 2;
  } else {
    // Day 6: Top 1 interest, 1 creator
    targetInterests = interests.slice(0, 1);
    maxCreators = 1;
  }

  if (targetInterests.length === 0) return [];

  // Use discovery library to select best creators
  const selectedCreators = selectCreators(
    targetInterests,
    maxCreators,
    contentPreferences,
    dayIndex
  );

  if (selectedCreators.length === 0) return [];

  // Convert to training actions
  return selectedCreators.map(creator => {
    const type = creatorActionType(creator.platform);
    const explanation = generateCreatorExplanation(creator, targetInterests);

    return {
      id: `day-${dayIndex + 1}-${type.toLowerCase()}-${creator.id}`,
      type,
      title: `${type === "SUBSCRIBE" ? "Subscribe to" : "Follow"} ${creator.name}`,
      topic: targetInterests[0]?.id,
      topicName: targetInterests[0]?.name,
      creator,
      description: `${type === "SUBSCRIBE" ? "Subscribe to" : "Follow"} ${creator.name} if you genuinely want more content aligned with your interests.`,
      why: explanation,
    } as TrainingAction;
  });
}

/**
 * Build ENGAGE actions for a day.
 * Engagement guidance varies intelligently by day and strategy.
 */
function buildEngageActions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  dayIndex: number
): TrainingAction[] {
  const topInterest = interests[0];
  const topContent = contentPreferences[0];
  const style = contentLabel(topContent);
  const topicText = topInterest ? `${topInterest.name.toLowerCase()} ` : "";

  // Day-specific engagement guidance
  const guidanceByDay = [
    // Day 1: Establish - watch fully and intentionally
    `Watch ${topicText}videos fully when they genuinely hold your attention. Only engage when content is truly useful.`,
    // Day 2: Reinforce - like/save what you want more of
    `Like and save ${style} ${topicText}content that truly represents what you want to see more of.`,
    // Day 3: Strengthen - save tutorials and useful content
    `Save ${style} posts and tutorials you would want to revisit. Completion signals are more powerful than passive scrolling.`,
    // Day 4: Expand - follow creators thoughtfully
    `Open creator profiles before following so your signal stays intentional. Quality over follow velocity.`,
    // Day 5: Deepen - comment and engage with communities
    `Comment thoughtfully on high-value content in your chosen topics. Meaningful engagement is more powerful than passive views.`,
    // Day 6: Refine - use skip and filtering
    `Use the "Not interested" or skip features when content drifts from your chosen topics. This refines your signal as much as engagement does.`,
    // Day 7: Maintain - keep it natural
    `Maintain your pattern naturally. Reinforcement works best when it feels intentional, not forced. Quality engagement over volume.`,
  ];

  return [
    {
      id: `day-${dayIndex + 1}-engage`,
      type: "ENGAGE" as const,
      title: "Engage naturally",
      topic: topInterest?.id,
      topicName: topInterest?.name,
      description: guidanceByDay[dayIndex],
      why: "FeedSmith gives you a training target, not an automation script. Quality, intentional engagement teaches the algorithm better than volume.",
    },
  ];
}

/**
 * Build AVOID actions for a day.
 * Uses filters to suppress unwanted content.
 */
function buildAvoidActions(
  blueprint: SignalBlueprint,
  dayIndex: number
): TrainingAction[] {
  if (!blueprint.suppressed.length) return [];

  // Distribute avoidance actions to different days for variety
  const suppressionByDay: Record<number, string[]> = {
    0: blueprint.suppressed.slice(0, 1),
    1: blueprint.suppressed.slice(0, 2),
    2: blueprint.suppressed.slice(0, 3),
    3: blueprint.suppressed.slice(1, 2),
    4: blueprint.suppressed.slice(0, 1),
    5: blueprint.suppressed.slice(0, 2),
    6: [], // No avoidance on day 7 - focus on maintenance
  };

  const todaysSuppressions = suppressionByDay[dayIndex] ?? [];

  return todaysSuppressions.map(filter => ({
    id: `day-${dayIndex + 1}-avoid-${actionSlug(filter)}`,
    type: "AVOID" as const,
    title: `Avoid ${filter}`,
    filter,
    description: `Skip ${filter.toLowerCase()} so you do not reinforce content you do not want in your feed.`,
    why: "Avoiding unwanted categories reduces accidental reinforcement. FeedSmith does not block or remove them, but you can control what signals you send.",
  }));
}

/**
 * Generate a human-readable summary of the training plan strategy.
 * Generated from actual user data, not hardcoded.
 */
function generatePlanSummary(
  blueprint: SignalBlueprint,
  contentPreferences: ContentPreference[]
): string {
  const interests = getAllInterests(blueprint);
  if (interests.length === 0) {
    return "No interests selected yet. Build your signal to get started.";
  }

  const topInterest = interests[0];
  const topTwo = interests.slice(0, 2);
  const topContent = contentPreferences[0];

  let summary = "";

  // Start with top interests
  if (topTwo.length === 1) {
    summary = `Your plan is entirely focused on ${topInterest.name}.`;
  } else {
    const names = topTwo.map(i => i.name).join(" and ");
    summary = `Your plan prioritizes ${names} as your core focus.`;
  }

  // Add content preference if strong
  if (topContent && topContent.strength > 60) {
    summary += ` ${topContent.name} content forms the core of your mix.`;
  }

  // Add progression strategy
  if (contentPreferences.length > 1) {
    summary += ` The first half of the week focuses on establishing and reinforcing these signals, while the second half shifts toward discovery and refinement.`;
  } else {
    summary += ` The plan progresses from broad discovery early in the week to deeper mastery by day 5, then refines and maintains through the weekend.`;
  }

  // Add filter note if applicable
  if (blueprint.suppressed.length > 0) {
    const filterCount = blueprint.suppressed.length;
    summary += ` You've also marked ${filterCount} ${filterCount === 1 ? "category" : "categories"} to avoid.`;
  }

  return summary;
}

/**
 * Main function to generate a complete 7-day Feed Training Plan.
 * The plan is deterministic and derived entirely from the user's preferences.
 */
export function generateFeedTrainingPlan(
  blueprint: SignalBlueprint,
  platform: TrainingPlatform = DEFAULT_PLATFORM
): FeedTrainingPlan {
  const interests = getAllInterests(blueprint);
  const contentPreferences = getContentPreferences(blueprint);

  const days = STAGE_DETAILS.map((stage, dayIndex) => ({
    ...stage,
    actions: [
      ...buildWatchActions(interests, contentPreferences, dayIndex),
      ...buildSearchActions(interests, contentPreferences, dayIndex),
      ...buildCreatorActions(interests, contentPreferences, dayIndex),
      ...buildEngageActions(interests, contentPreferences, dayIndex),
      ...buildAvoidActions(blueprint, dayIndex),
    ],
  }));

  const summary = generatePlanSummary(blueprint, contentPreferences);

  return {
    platform,
    days,
    summary,
  };
}

export function normalizeCompletedActions(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const completed: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key === "string" && typeof value === "boolean") {
      completed[key] = value;
    }
  }

  return completed;
}

export function calculateDayProgress(
  day: FeedTrainingDay,
  completed: Record<string, boolean>
): { completedCount: number; totalActions: number; progressPercent: number } {
  const totalActions = day.actions.length;
  const completedCount = day.actions.filter(action => completed[action.id]).length;

  return {
    completedCount,
    totalActions,
    progressPercent: totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0,
  };
}

export function calculatePlanProgress(
  plan: FeedTrainingPlan,
  completed: Record<string, boolean>
): { completedCount: number; totalActions: number; progressPercent: number } {
  const totalActions = plan.days.reduce((sum, day) => sum + day.actions.length, 0);
  const completedCount = plan.days.reduce(
    (sum, day) => sum + day.actions.filter(action => completed[action.id]).length,
    0
  );

  return {
    completedCount,
    totalActions,
    progressPercent: totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0,
  };
}
