import type {
  FeedPreferences,
  TrainingAction,
  DiscoveryItem,
} from "../types";
import { DISCOVERY_TOPICS } from "../discoveryLibrary";
import { INTERESTS } from "../interestData";

export type RelevanceRelationship =
  | "direct_match"
  | "related_topic"
  | "weak_relationship"
  | "unrelated"
  | "conflicts_with_suppression";

export interface ItemRelevanceEvaluation {
  itemId: string;
  itemType: string;
  itemTitle: string;
  relationship: RelevanceRelationship;
  reason: string;
  metadataLimitation?: string;
}

/**
 * Normalizes strings for robust, deterministic comparison.
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Checks if a string contains any suppressed terms from the profile.
 */
function matchesSuppression(text: string, filters: string[]): string | null {
  const normText = text.toLowerCase();
  for (const filter of filters) {
    const f = filter.toLowerCase().trim();
    if (f.length > 0 && normText.includes(f)) {
      return filter;
    }
  }
  return null;
}

/**
 * Helper to retrieve known related topic IDs and aliases for an interest.
 */
function getRelatedTopicIds(interestId: string): Set<string> {
  const related = new Set<string>();
  const topicObj = DISCOVERY_TOPICS[interestId];

  if (topicObj) {
    if (topicObj.relatedTopics) {
      topicObj.relatedTopics.forEach(t => related.add(t));
    }
    if (topicObj.aliases) {
      topicObj.aliases.forEach(a => related.add(a));
    }
    if (topicObj.subtopics) {
      topicObj.subtopics.forEach(st => {
        related.add(st.id);
        if (st.related) st.related.forEach(r => related.add(r));
      });
    }
  }

  // Also check category match in INTERESTS
  const interestMeta = INTERESTS.find(i => i.id === interestId);
  if (interestMeta?.category) {
    const categoryGroup = INTERESTS.filter(i => i.category === interestMeta.category);
    categoryGroup.forEach(i => related.add(i.id));
  }

  return related;
}

/**
 * Evaluates the relevance of a TrainingAction relative to a user's FeedPreferences.
 */
export function evaluateActionRelevance(
  action: TrainingAction,
  profile: FeedPreferences
): ItemRelevanceEvaluation {
  const filters = profile.filters ?? [];
  const userInterests = profile.interests ?? [];
  const userInterestIds = new Set(userInterests.map(i => i.id));
  const userInterestNames = new Set(userInterests.map(i => normalize(i.name)));

  // 1. Check AVOID actions (intentional suppression handling)
  if (action.type === "AVOID") {
    const isSuppressed = filters.some(f => normalize(f) === normalize(action.filter));
    return {
      itemId: action.id,
      itemType: action.type,
      itemTitle: action.title,
      relationship: isSuppressed ? "direct_match" : "weak_relationship",
      reason: `AVOID action targeting suppressed category "${action.filter}".`,
    };
  }

  // 2. Check for suppression conflicts in positive recommendation actions
  const actionText = `${action.title} ${action.description} ${"topicName" in action ? action.topicName ?? "" : ""}`;
  const suppressionConflict = matchesSuppression(actionText, filters);
  if (suppressionConflict) {
    return {
      itemId: action.id,
      itemType: action.type,
      itemTitle: action.title,
      relationship: "conflicts_with_suppression",
      reason: `Action mentions suppressed filter "${suppressionConflict}".`,
    };
  }

  // Extract action topic identifiers
  const actionTopicId = "topic" in action ? action.topic : undefined;
  const actionTopicName = "topicName" in action ? action.topicName : undefined;
  const normTopicName = actionTopicName ? normalize(actionTopicName) : "";

  let metadataLimitation: string | undefined;
  if (actionTopicId && !DISCOVERY_TOPICS[actionTopicId] && !INTERESTS.find(i => i.id === actionTopicId)) {
    metadataLimitation = `Topic "${actionTopicId}" has no entry in DISCOVERY_TOPICS; classified via name match.`;
  }

  // 3. Direct match check
  if (actionTopicId && userInterestIds.has(actionTopicId)) {
    return {
      itemId: action.id,
      itemType: action.type,
      itemTitle: action.title,
      relationship: "direct_match",
      reason: `Direct match with user selected interest ID "${actionTopicId}".`,
      metadataLimitation,
    };
  }

  if (normTopicName && Array.from(userInterestNames).some(name => normTopicName.includes(name) || name.includes(normTopicName))) {
    return {
      itemId: action.id,
      itemType: action.type,
      itemTitle: action.title,
      relationship: "direct_match",
      reason: `Direct match with user interest name "${actionTopicName}".`,
      metadataLimitation,
    };
  }

  // For creator actions, check if creator topics directly match
  if (action.type === "FOLLOW" || action.type === "SUBSCRIBE") {
    const creatorTopics = action.creator.topics ?? [];
    if (creatorTopics.some(t => userInterestIds.has(t))) {
      return {
        itemId: action.id,
        itemType: action.type,
        itemTitle: action.title,
        relationship: "direct_match",
        reason: `Creator "${action.creator.name}" is tagged with selected interest(s): ${creatorTopics.filter(t => userInterestIds.has(t)).join(", ")}.`,
        metadataLimitation,
      };
    }
  }

  // 4. Related topic check
  for (const interest of userInterests) {
    const relatedIds = getRelatedTopicIds(interest.id);
    if (actionTopicId && relatedIds.has(actionTopicId)) {
      return {
        itemId: action.id,
        itemType: action.type,
        itemTitle: action.title,
        relationship: "related_topic",
        reason: `Topic "${actionTopicId}" is related to selected interest "${interest.name}".`,
        metadataLimitation,
      };
    }

    if (action.type === "FOLLOW" || action.type === "SUBSCRIBE") {
      const creatorTopics = action.creator.topics ?? [];
      if (creatorTopics.some(t => relatedIds.has(t))) {
        return {
          itemId: action.id,
          itemType: action.type,
          itemTitle: action.title,
          relationship: "related_topic",
          reason: `Creator "${action.creator.name}" covers related topic for "${interest.name}".`,
          metadataLimitation,
        };
      }
    }
  }

  // 5. General ENGAGE action check
  if (action.type === "ENGAGE") {
    return {
      itemId: action.id,
      itemType: action.type,
      itemTitle: action.title,
      relationship: userInterests.length > 0 ? "direct_match" : "weak_relationship",
      reason: `General training engagement action focusing on top interest "${actionTopicName ?? "general"}".`,
      metadataLimitation,
    };
  }

  // 6. Weak or unrelated
  const matchesContentPref = (profile.contentPreferences ?? []).some(
    cp => actionText.toLowerCase().includes(cp.id.toLowerCase()) || actionText.toLowerCase().includes(cp.name.toLowerCase())
  );

  if (matchesContentPref) {
    return {
      itemId: action.id,
      itemType: action.type,
      itemTitle: action.title,
      relationship: "weak_relationship",
      reason: "Matches user content-style preference but not primary interest topics.",
      metadataLimitation,
    };
  }

  return {
    itemId: action.id,
    itemType: action.type,
    itemTitle: action.title,
    relationship: "unrelated",
    reason: "No match found with user interests, subtopics, categories, or filters.",
    metadataLimitation,
  };
}

/**
 * Evaluates the relevance of a DiscoveryItem relative to a user's FeedPreferences.
 */
export function evaluateDiscoveryItemRelevance(
  item: DiscoveryItem,
  profile: FeedPreferences
): ItemRelevanceEvaluation {
  const filters = profile.filters ?? [];
  const userInterests = profile.interests ?? [];
  const userInterestIds = new Set(userInterests.map(i => i.id));
  const userInterestNames = new Set(userInterests.map(i => normalize(i.name)));

  // 1. Suppression check
  const itemText = `${item.title} ${item.reason} ${item.topicName} ${item.subtopicName ?? ""} ${item.category ?? ""}`;
  const suppressionConflict = matchesSuppression(itemText, filters);
  if (suppressionConflict) {
    return {
      itemId: item.id,
      itemType: item.type,
      itemTitle: item.title,
      relationship: "conflicts_with_suppression",
      reason: `Discovery item contains suppressed term "${suppressionConflict}".`,
    };
  }

  let metadataLimitation: string | undefined;
  if (!DISCOVERY_TOPICS[item.topicId] && !INTERESTS.find(i => i.id === item.topicId)) {
    metadataLimitation = `Topic "${item.topicId}" has no catalog definition in DISCOVERY_TOPICS.`;
  }

  // 2. Direct match
  if (userInterestIds.has(item.topicId)) {
    return {
      itemId: item.id,
      itemType: item.type,
      itemTitle: item.title,
      relationship: "direct_match",
      reason: `Direct match with selected interest ID "${item.topicId}".`,
      metadataLimitation,
    };
  }

  const normItemTopicName = normalize(item.topicName);
  if (Array.from(userInterestNames).some(name => normItemTopicName.includes(name) || name.includes(normItemTopicName))) {
    return {
      itemId: item.id,
      itemType: item.type,
      itemTitle: item.title,
      relationship: "direct_match",
      reason: `Direct match with interest display name "${item.topicName}".`,
      metadataLimitation,
    };
  }

  // 3. Related topic
  for (const interest of userInterests) {
    const relatedIds = getRelatedTopicIds(interest.id);
    if (relatedIds.has(item.topicId) || (item.subtopicId && relatedIds.has(item.subtopicId))) {
      return {
        itemId: item.id,
        itemType: item.type,
        itemTitle: item.title,
        relationship: "related_topic",
        reason: `Item topic "${item.topicId}" is related to selected interest "${interest.name}".`,
        metadataLimitation,
      };
    }

    if (item.creator) {
      const creatorTopics = item.creator.topics ?? [];
      if (creatorTopics.some(t => userInterestIds.has(t) || relatedIds.has(t))) {
        return {
          itemId: item.id,
          itemType: item.type,
          itemTitle: item.title,
          relationship: "related_topic",
          reason: `Creator "${item.creator.name}" covers related topic for "${interest.name}".`,
          metadataLimitation,
        };
      }
    }
  }

  // 4. Weak relationship (e.g. content format match)
  const matchesContentPref = (profile.contentPreferences ?? []).some(
    cp => itemText.toLowerCase().includes(cp.id.toLowerCase()) || itemText.toLowerCase().includes(cp.name.toLowerCase())
  );
  if (matchesContentPref) {
    return {
      itemId: item.id,
      itemType: item.type,
      itemTitle: item.title,
      relationship: "weak_relationship",
      reason: "Matches content-style preference without direct topic match.",
      metadataLimitation,
    };
  }

  return {
    itemId: item.id,
    itemType: item.type,
    itemTitle: item.title,
    relationship: "unrelated",
    reason: "No matching interest, related topic, subtopic, or content preference found.",
    metadataLimitation,
  };
}

