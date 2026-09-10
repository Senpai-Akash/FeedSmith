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
 * Score a search query based on interest strength, content preference alignment,
 * and day progression. This keeps the recommendation engine deterministic while
 * making stronger interests and preferred content formats win more often.
 */
function scoreSearchQuery(
  query: DiscoverySearchQuery,
  interest: FeedPreference,
  dayIndex: number,
  contentPreferences: ContentPreference[]
): number {
  let score = 0;

  // Stronger interests deserve stronger recommendation weight.
  score += interest.strength / 10;

  // Specificity matching: days progress through broad → specific → discovery.
  if (dayIndex < 2) {
    if (query.specificity === "broad") score += 12;
    else if (query.specificity === "specific") score += 7;
  } else if (dayIndex < 4) {
    if (query.specificity === "specific") score += 12;
    else if (query.specificity === "discovery") score += 7;
  } else if (dayIndex < 6) {
    if (query.specificity === "discovery") score += 12;
    else if (query.specificity === "specific") score += 8;
  } else {
    if (query.specificity === "broad") score += 10;
    else if (query.specificity === "specific") score += 7;
  }

  // A direct content-type match should heavily influence priority.
  if (query.contentTypes && query.contentTypes.length > 0) {
    const userContentTypes = new Set(
      contentPreferences.map(cp => cp.id).filter(id => Boolean(id))
    );
    const matchingTypes = query.contentTypes.filter(ct => userContentTypes.has(ct));
    score += matchingTypes.length * 5;
  }

  // Querys tied to a matching subtopic and an interest with stronger volume get a bonus.
  if (query.subtopic) {
    score += interest.strength > 70 ? 2 : interest.strength > 45 ? 1 : 0;
  }

  return score;
}

/**
 * Select the best search query for an interest on a given day.
 */
export function selectSearchQuery(
  interest: FeedPreference,
  dayIndex: number,
  contentPreferences: ContentPreference[]
): string {
  const topic = getDiscoveryTopic(interest.id);

  if (!topic || topic.searches.length === 0) {
    return `${interest.name} content`;
  }

  const scored = topic.searches.map((query, index) => ({
    query,
    score: scoreSearchQuery(query, interest, dayIndex, contentPreferences),
    index,
  }));

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  return scored[0].query.query;
}

/**
 * Score a creator based on relevance to interests, content preference fit,
 * and the training stage. Deterministic by design.
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
  interests: FeedPreference[],
  contentPreferences: ContentPreference[] = [],
  dayIndex: number = 0
): number {
  let score = 0;

  const creatorTopics = new Set(creator.topics.map(t => String(t)));
  const matchingInterests = interests.filter(interest => creatorTopics.has(interest.id));

  if (matchingInterests.length === 0) {
    return 0;
  }

  matchingInterests.forEach(interest => {
    score += interest.strength;
  });

  if (matchingInterests.length > 1) {
    score += 10;
  }

  if (contentPreferences.length > 0) {
    const contentTypes = new Set(contentPreferences.map(cp => cp.id));
    const creatorText = [creator.name, creator.description].join(" ").toLowerCase();
    const matches = Array.from(contentTypes).filter(type => creatorText.includes(type));
    score += matches.length * 4;
  }

  if (dayIndex >= 3) {
    score += 4;
  }

  return score;
}

/**
 * Select creators for a given set of interests.
 */
export function selectCreators(
  interests: FeedPreference[],
  maxCount: number = 3,
  contentPreferences: ContentPreference[] = [],
  dayIndex: number = 0
): CreatorRecommendation[] {
  if (interests.length === 0) {
    return [];
  }

  const discoveryCatalog = interests
    .flatMap(interest => getDiscoveryTopic(interest.id)?.creators ?? [])
    .map(creator => ({
      id: creator.id,
      name: creator.name,
      platform: creator.platform,
      topics: creator.topics,
      url: creator.url,
      description: creator.description,
    }));

  const allCreators = [...discoveryCatalog, ...INTEREST_CREATOR_CATALOG].filter(
    (creator, index, array) =>
      array.findIndex(item => item.id === creator.id) === index
  );

  const scored = allCreators.map((creator, index) => ({
    creator,
    score: scoreCreator(creator, interests, contentPreferences, dayIndex),
    index,
  }));

  const matching = scored.filter(item => item.score > 0);
  matching.sort(
    (a, b) =>
      b.score - a.score ||
      a.creator.name.localeCompare(b.creator.name) ||
      a.index - b.index
  );

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
 */
export function generateSearchExplanation(
  interest: FeedPreference,
  contentPreferences: ContentPreference[],
  isTopInterest: boolean
): string {
  const parts: string[] = [];

  if (isTopInterest) {
    parts.push(`${interest.name} is your strongest interest (${interest.strength}/100)`);
  } else {
    parts.push(`${interest.name} is one of your selected interests (${interest.strength}/100)`);
  }

  if (contentPreferences.length > 0) {
    const topContent = contentPreferences[0];
    parts.push(`${topContent.name} is your strongest content preference (${topContent.strength}/100)`);
  }

  return parts.join(". ") + ".";
}

/**
 * Generate an explanation for why a creator was recommended.
 */
export function generateCreatorExplanation(
  creator: CreatorRecommendation,
  interests: FeedPreference[]
): string {
  const creatorTopicIds = new Set(creator.topics.map(t => String(t)));
  const matchingInterests = interests
    .filter(i => creatorTopicIds.has(i.id))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2);

  if (matchingInterests.length === 0) {
    return "Matches your interests.";
  }

  const topicNames = matchingInterests.map(i => i.name).join(" and ");
  return `Focuses on ${topicNames}.`;
}

/**
 * Get relevant subtopics for an interest.
 */
export function getRelevantSubtopics(
  interest: FeedPreference,
  maxCount: number = 2
): Array<{ name: string; id: string }> {
  const topic = getDiscoveryTopic(interest.id);

  if (!topic || topic.subtopics.length === 0) {
    return [];
  }

  const effectiveMax =
    interest.strength > 80
      ? Math.min(maxCount, topic.subtopics.length)
      : Math.min(Math.max(maxCount - 1, 1), topic.subtopics.length);

  return topic.subtopics.slice(0, effectiveMax).map(st => ({
    id: st.id,
    name: st.name,
  }));
}
