import {
  FeedPreferences,
  FeedPreference,
  ContentPreference,
  DiscoveryTopic,
  DiscoverySearchQuery,
  CreatorRecommendation,
} from "./types";
import { DISCOVERY_TOPICS } from "./discoveryLibrary";
import { INTEREST_CREATOR_CATALOG } from "./interestData";

/**
 * Discovery Selection Module
 *
 * Ranks and selects discovery data based on:
 * - User interest strength
 * - User content preferences
 * - Current training day/stage
 * - Deterministic ranking (no randomness)
 */

/**
 * Get the discovery topic for an interest.
 * Falls back gracefully if not found.
 */
export function getDiscoveryTopic(interestId: string): DiscoveryTopic | null {
  return DISCOVERY_TOPICS[interestId] ?? null;
}

/**
 * Score a search query based on user preferences and day.
 *
 * Scoring factors:
 * - Specificity level (matches the day's progression)
 * - Content type alignment (if specified)
 * - Subtopic relevance (if user has strong related interests)
 */
function scoreSearchQuery(
  query: DiscoverySearchQuery,
  dayIndex: number,
  contentPreferences: ContentPreference[]
): number {
  let score = 0;

  // Specificity matching: days progress through broad → specific → discovery
  if (dayIndex < 2) {
    // Days 1-2: Broad queries preferred
    if (query.specificity === "broad") score += 10;
    else if (query.specificity === "specific") score += 5;
  } else if (dayIndex < 4) {
    // Days 3-4: Specific queries preferred
    if (query.specificity === "specific") score += 10;
    else if (query.specificity === "discovery") score += 5;
  } else if (dayIndex < 6) {
    // Days 5-6: Discovery queries preferred
    if (query.specificity === "discovery") score += 10;
    else if (query.specificity === "specific") score += 5;
  } else {
    // Day 7: Back to broad
    if (query.specificity === "broad") score += 10;
    else if (query.specificity === "specific") score += 5;
  }

  // Content type matching
  if (query.contentTypes && query.contentTypes.length > 0) {
    const userContentTypes = new Set(
      contentPreferences.map(cp => cp.id).filter(id => id)
    );
    const matchingTypes = query.contentTypes.filter(ct => userContentTypes.has(ct));
    score += matchingTypes.length * 3;
  }

  return score;
}

/**
 * Select the best search query for an interest on a given day.
 *
 * Returns the highest-scoring query, with tiebreakers
 * to ensure deterministic results.
 */
export function selectSearchQuery(
  interest: FeedPreference,
  dayIndex: number,
  contentPreferences: ContentPreference[]
): string {
  const topic = getDiscoveryTopic(interest.id);

  if (!topic || topic.searches.length === 0) {
    // Fallback to generic suggestion
    return `${interest.name} content`;
  }

  // Score all searches
  const scored = topic.searches.map((query, index) => ({
    query,
    score: scoreSearchQuery(query, dayIndex, contentPreferences),
    index, // for deterministic tiebreaker
  }));

  // Sort by score (descending), then by index (for stability)
  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  return scored[0].query.query;
}

/**
 * Score a creator based on relevance to interests and content preferences.
 *
 * Factors:
 * - Topic match to user's strongest interests
 * - Multiple topic alignment (bonus for covering multiple interests)
 */
function scoreCreator(
  creator: {
    id: string;
    name: string;
    platform: string;
    topics: readonly string[];
    url?: string;
    description: string;
  },
  interests: FeedPreference[]
): number {
  let score = 0;

  // For each creator topic, find matching user interests
  const creatorTopics = new Set(creator.topics.map(t => String(t)));
  const matchingInterests = interests.filter(interest =>
    creatorTopics.has(interest.id)
  );

  if (matchingInterests.length === 0) {
    return 0; // No matching interests
  }

  // Score based on matching interest strengths
  matchingInterests.forEach(interest => {
    score += interest.strength;
  });

  // Bonus for covering multiple interests
  if (matchingInterests.length > 1) {
    score += 10;
  }

  return score;
}

/**
 * Select creators for a given set of interests.
 *
 * Returns only creators relevant to the user's interests,
 * sorted by relevance. Never returns creators with no overlap.
 */
export function selectCreators(
  interests: FeedPreference[],
  maxCount: number = 3
): CreatorRecommendation[] {
  if (interests.length === 0) {
    return [];
  }

  // Score all creators
  const scored = INTEREST_CREATOR_CATALOG.map((creator, index) => ({
    creator,
    score: scoreCreator(creator, interests),
    index,
  }));

  // Filter out non-matching creators and sort
  const matching = scored.filter(item => item.score > 0);
  matching.sort(
    (a, b) =>
      b.score - a.score ||
      a.creator.name.localeCompare(b.creator.name) ||
      a.index - b.index
  );

  // Return top N
  return matching.slice(0, maxCount).map(item => ({
    id: item.creator.id,
    name: item.creator.name,
    platform: item.creator.platform as "instagram" | "youtube" | "tiktok",
    topics: Array.isArray(item.creator.topics) ? [...item.creator.topics] : [],
    url: item.creator.url,
    description: item.creator.description,
  } as CreatorRecommendation));
}

/**
 * Generate an explanation for why a search was recommended.
 *
 * Example: "Programming is your strongest interest (90/100). Tutorials are
 * your strongest content preference (95/100)."
 */
export function generateSearchExplanation(
  interest: FeedPreference,
  contentPreferences: ContentPreference[],
  isTopInterest: boolean
): string {
  const parts: string[] = [];

  // Mention the interest
  if (isTopInterest) {
    parts.push(`${interest.name} is your strongest interest (${interest.strength}/100)`);
  } else {
    parts.push(`${interest.name} is one of your selected interests (${interest.strength}/100)`);
  }

  // Mention the top content preference if applicable
  if (contentPreferences.length > 0) {
    const topContent = contentPreferences[0];
    parts.push(`${topContent.name} is your strongest content preference (${topContent.strength}/100)`);
  }

  return parts.join(". ") + ".";
}

/**
 * Generate an explanation for why a creator was recommended.
 *
 * Example: "This creator matches your interest in programming and AI."
 */
export function generateCreatorExplanation(
  creator: CreatorRecommendation,
  interests: FeedPreference[]
): string {
  const creatorTopicIds = new Set(creator.topics.map(t => String(t)));
  const matchingInterests = interests
    .filter(i => creatorTopicIds.has(i.id))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2); // Top 2 matches

  if (matchingInterests.length === 0) {
    return "Matches your interests.";
  }

  const topicNames = matchingInterests.map(i => i.name).join(" and ");
  return `Focuses on ${topicNames}.`;
}

/**
 * Get relevant subtopics for an interest.
 *
 * Returns subtopics that might be interesting based on strength.
 * Higher-strength interests get more subtopic exploration.
 */
export function getRelevantSubtopics(
  interest: FeedPreference,
  maxCount: number = 2
): Array<{ name: string; id: string }> {
  const topic = getDiscoveryTopic(interest.id);

  if (!topic || topic.subtopics.length === 0) {
    return [];
  }

  // Stronger interests can explore more subtopics
  const effectiveMax =
    interest.strength > 80 ? Math.min(maxCount, topic.subtopics.length) : Math.min(maxCount - 1, topic.subtopics.length);

  return topic.subtopics.slice(0, effectiveMax).map(st => ({
    id: st.id,
    name: st.name,
  }));
}
