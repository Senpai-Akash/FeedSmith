import {
  ContentPreference,
  CreatorRecommendation,
  DiscoveryActionType,
  DiscoveryDifficulty,
  DiscoveryFeed,
  DiscoveryItem,
  DiscoveryPlaybookGuidance,
  DiscoveryStage,
  DiscoveryTopic,
  FeedFilter,
  FeedPreference,
  FeedTrainingPlan,
  SignalBlueprint,
  TrainingPlatform,
} from "./types";
import { DISCOVERY_TOPICS } from "./discoveryLibrary";
import { INTEREST_CREATOR_CATALOG, INTEREST_SEARCH_SUGGESTIONS } from "./interestData";

export interface GenerateDiscoveryOptions {
  blueprint: SignalBlueprint;
  dayIndex: number; // 0 to 6
  completedActions?: Record<string, boolean>;
  platform?: TrainingPlatform;
  plan?: FeedTrainingPlan;
}

interface StageMeta {
  stage: DiscoveryStage;
  stageTitle: string;
  stageGoal: string;
  focus: "core" | "related" | "depth" | "creator" | "advanced" | "crossover" | "refinement";
}

const STAGE_CONFIG: Record<number, StageMeta> = {
  0: {
    stage: "core",
    stageTitle: "Day 1 — Core Foundation",
    stageGoal: "Establish initial high-signal baseline around your strongest interests.",
    focus: "core",
  },
  1: {
    stage: "related",
    stageTitle: "Day 2 — Related Exploration",
    stageGoal: "Branch into closely related subtopics to provide rich context to your feed.",
    focus: "related",
  },
  2: {
    stage: "depth",
    stageTitle: "Day 3 — Topic Depth",
    stageGoal: "Drill into specific, concrete subtopics to strengthen high-intent signals.",
    focus: "depth",
  },
  3: {
    stage: "creator",
    stageTitle: "Day 4 — Creator Discovery",
    stageGoal: "Identify and follow creators whose content reinforces your target topics.",
    focus: "creator",
  },
  4: {
    stage: "advanced",
    stageTitle: "Day 5 — Advanced & Deep Dives",
    stageGoal: "Explore specialized techniques, deep dives, and production-grade concepts.",
    focus: "advanced",
  },
  5: {
    stage: "crossover",
    stageTitle: "Day 6 — Signal Crossover",
    stageGoal: "Synthesize your primary and secondary interests into unique crossover recommendations.",
    focus: "crossover",
  },
  6: {
    stage: "refinement",
    stageTitle: "Day 7 — Refinement & Curation",
    stageGoal: "Curate and maintain high-performing signals for long-term feed health.",
    focus: "refinement",
  },
};

/**
 * Safely retrieve a discovery topic from the curated catalog.
 */
export function getDiscoveryTopic(topicId: string): DiscoveryTopic | null {
  return DISCOVERY_TOPICS[topicId] ?? null;
}

/**
 * Check if an item is suppressed by user filters.
 */
function isSuppressed(
  text: string,
  tags: string[] = [],
  filters: FeedFilter[] = []
): boolean {
  if (!filters || filters.length === 0) return false;

  const lowerText = text.toLowerCase();
  const lowerTags = tags
    .map(t => (t ?? "").toLowerCase().trim())
    .filter(t => t.length > 0);

  return filters.some(filter => {
    const f = (filter ?? "").toLowerCase().trim();
    if (!f) return false;
    if (lowerText.includes(f)) return true;
    if (lowerTags.some(tag => tag.includes(f) || (tag.length >= 3 && f.includes(tag)))) return true;
    return false;
  });
}

/**
 * Get all interests from a blueprint sorted by strength.
 */
function extractInterests(blueprint: SignalBlueprint): FeedPreference[] {
  const list = [
    ...(blueprint.primaryInterests ?? []),
    ...(blueprint.secondaryInterests ?? []),
  ].filter(i => i && typeof i.strength === "number" && i.strength > 0);

  return list.sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

/**
 * Get all content preferences sorted by strength.
 */
function extractContentPreferences(blueprint: SignalBlueprint): ContentPreference[] {
  const list = [...(blueprint.contentPreferences ?? [])].filter(
    c => c && typeof c.strength === "number" && c.strength > 0
  );
  return list.sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

/**
 * Generate deterministic playbook guidance for a discovery recommendation.
 */
function generateGuidance(
  actionType: DiscoveryActionType,
  title: string,
  topicName: string,
  platform: TrainingPlatform
): DiscoveryPlaybookGuidance {
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  switch (actionType) {
    case "Search":
      return {
        what: `Search for "${title}" on ${platformLabel}`,
        how: `Open ${platformLabel}, enter the exact query "${title}", and explore the top 2-3 most relevant results.`,
        do: [
          `Watch the selected result to completion if it offers real value`,
          `Save or bookmark videos that provide high-density insights`,
        ],
        dont: [
          `Click on sensationalized or clickbait thumbnails`,
          `Quickly scroll away before the platform registers watch intent`,
        ],
      };
    case "Follow":
      return {
        what: `Follow creator ${title} on ${platformLabel}`,
        how: `Navigate to ${title}'s profile on ${platformLabel}, inspect their recent posts on ${topicName}, and follow them.`,
        do: [
          `Review their recent uploads to ensure consistent focus on ${topicName}`,
          `Engage thoughtfully with at least one high-value post`,
        ],
        dont: [
          `Follow accounts that frequently deviate into unrelated drama`,
          `Unfollow immediately without giving the algorithm time to adjust`,
        ],
      };
    case "Watch":
      return {
        what: `Watch ${topicName} content on ${platformLabel}`,
        how: `Find high-signal ${topicName} material on ${platformLabel} and consume it with focused attention.`,
        do: [
          `Watch through key explanatory segments`,
          `Signal intent with a like or save on genuinely helpful content`,
        ],
        dont: [
          `Multitask or leave videos running passively on mute`,
          `Interact with unrelated recommendations in the sidebar`,
        ],
      };
    case "Explore":
      return {
        what: `Explore ${topicName} subtopics on ${platformLabel}`,
        how: `Browse tags, playlists, and community posts around ${title} on ${platformLabel}.`,
        do: [
          `Identify recurring sub-niches and specialized channels`,
          `Note specific terminology to refine your future searches`,
        ],
        dont: [
          `Let autoplay wander into unrelated algorithmic traps`,
          `Engage with superficial listicles or low-effort shorts`,
        ],
      };
  }
}

/**
 * Build deterministic Search Path discovery items.
 */
function buildSearchPaths(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  filters: FeedFilter[],
  dayIndex: number,
  stageMeta: StageMeta,
  platform: TrainingPlatform,
  completedActions: Record<string, boolean>
): DiscoveryItem[] {
  if (interests.length === 0) return [];

  const items: DiscoveryItem[] = [];
  const topContent = contentPreferences[0]?.name?.toLowerCase() ?? "tutorials";

  interests.slice(0, 3).forEach((interest, intIndex) => {
    const topic = getDiscoveryTopic(interest.id);
    const rawQueries = topic?.searches ?? [];
    const fallbackQueries = INTEREST_SEARCH_SUGGESTIONS[interest.id] ?? [
      `${interest.name} essentials`,
      `${interest.name} deep dive`,
    ];

    // Select queries based on day stage
    let candidates: { query: string; subtopic?: string; difficulty: DiscoveryDifficulty }[] = [];

    if (stageMeta.focus === "core") {
      const broad = rawQueries.filter(q => q.specificity === "broad");
      candidates = (broad.length > 0 ? broad : rawQueries).map(q => ({
        query: q.query,
        subtopic: q.subtopic,
        difficulty: "foundational",
      }));
      if (candidates.length === 0) {
        candidates = [{ query: `${interest.name} fundamentals`, difficulty: "foundational" }];
      }
    } else if (stageMeta.focus === "related" || stageMeta.focus === "depth") {
      const specific = rawQueries.filter(q => q.specificity === "specific");
      candidates = (specific.length > 0 ? specific : rawQueries).map(q => ({
        query: q.query,
        subtopic: q.subtopic,
        difficulty: stageMeta.focus === "depth" ? "intermediate" : "foundational",
      }));
    } else if (stageMeta.focus === "advanced") {
      const discovery = rawQueries.filter(q => q.specificity === "discovery");
      candidates = (discovery.length > 0 ? discovery : rawQueries).map(q => ({
        query: q.query,
        subtopic: q.subtopic,
        difficulty: "advanced",
      }));
    } else {
      candidates = rawQueries.map(q => ({
        query: q.query,
        subtopic: q.subtopic,
        difficulty: q.specificity === "discovery" ? "advanced" : "intermediate",
      }));
    }

    if (candidates.length === 0) {
      candidates = fallbackQueries.map((q, idx) => ({
        query: q,
        difficulty: idx === 0 ? "foundational" : "intermediate",
      }));
    }

    // Filter out suppressed queries
    const validCandidates = candidates.filter(
      c => !isSuppressed(c.query, [interest.name, c.subtopic ?? ""], filters)
    );

    if (validCandidates.length > 0) {
      // Deterministically pick candidate using dayIndex and interest index
      const picked = validCandidates[(dayIndex + intIndex) % validCandidates.length];
      const actionId = `day-${dayIndex + 1}-search-${interest.id}`;
      const isCompleted = Boolean(completedActions[actionId]);

      const subtopicObj = topic?.subtopics.find(s => s.id === picked.subtopic);
      const subtopicName = subtopicObj?.name ?? (picked.subtopic ? picked.subtopic.replace(/-/g, " ") : undefined);

      const isPrimary = intIndex < 2;
      let reason = `Recommended because ${interest.name} is one of your ${
        isPrimary ? "primary" : "secondary"
      } interests (${interest.strength}/100).`;

      if (subtopicName) {
        reason += ` This search expands into ${subtopicName} to sharpen your signal.`;
      }
      if (contentPreferences.length > 0) {
        reason += ` It aligns with your preference for ${topContent} content.`;
      }

      items.push({
        id: `disc-search-${interest.id}-${dayIndex}-${intIndex}`,
        title: picked.query,
        topicId: interest.id,
        topicName: interest.name,
        subtopicId: picked.subtopic,
        subtopicName,
        category: topic?.description,
        type: "search",
        stage: stageMeta.stage,
        difficulty: picked.difficulty,
        relevance: Math.min(100, Math.round(interest.strength * (isPrimary ? 1.0 : 0.85))),
        reason,
        action: "Search",
        actionable: true,
        actionId,
        completed: isCompleted,
        searchQuery: picked.query,
        contentTypes: contentPreferences.map(c => c.name.toLowerCase()),
        guidance: generateGuidance("Search", picked.query, interest.name, platform),
      });
    }
  });

  return items;
}

/**
 * Build deterministic Creator discovery items.
 */
function buildCreatorRecommendations(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  filters: FeedFilter[],
  dayIndex: number,
  stageMeta: StageMeta,
  platform: TrainingPlatform,
  completedActions: Record<string, boolean>
): DiscoveryItem[] {
  if (interests.length === 0) return [];

  const items: DiscoveryItem[] = [];
  const allCatalogCreators: CreatorRecommendation[] = [];

  // Collect creators from topics and catalog
  interests.forEach(interest => {
    const topic = getDiscoveryTopic(interest.id);
    if (topic?.creators) {
      topic.creators.forEach(c => {
        allCatalogCreators.push({
          id: c.id,
          name: c.name,
          platform: (c.platform as TrainingPlatform) ?? platform,
          topics: c.topics,
          description: c.description,
          url: c.url,
        });
      });
    }
  });

  INTEREST_CREATOR_CATALOG.forEach(c => {
    allCatalogCreators.push({
      id: c.id,
      name: c.name,
      platform: (c.platform as TrainingPlatform) ?? platform,
      topics: [...c.topics],
      description: c.description,
      url: c.url,
    });
  });

  // Deduplicate creators by ID
  const uniqueCreators = allCatalogCreators.filter(
    (creator, idx, arr) => arr.findIndex(item => item.id === creator.id) === idx
  );

  // Score and filter creators
  const scoredCreators = uniqueCreators
    .map(creator => {
      if (isSuppressed(creator.name + " " + creator.description, creator.topics, filters)) {
        return null;
      }

      let score = 0;
      const matchedInterests = interests.filter(interest =>
        creator.topics.some(t => t.toLowerCase() === interest.id.toLowerCase() || t.toLowerCase() === interest.name.toLowerCase())
      );

      if (matchedInterests.length === 0) return null;

      matchedInterests.forEach(interest => {
        score += interest.strength;
      });

      if (contentPreferences.length > 0) {
        const topContent = contentPreferences[0].id.toLowerCase();
        if (creator.description.toLowerCase().includes(topContent)) {
          score += 15;
        }
      }

      return {
        creator,
        matchedInterests,
        score,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.score - a.score || a.creator.name.localeCompare(b.creator.name));

  scoredCreators.slice(0, 3).forEach((item, idx) => {
    const primaryMatch = item.matchedInterests[0];
    const actionId = `day-${dayIndex + 1}-creator-${item.creator.id}`;
    const isCompleted = Boolean(completedActions[actionId]);

    const topicsLabel = item.matchedInterests.map(i => i.name).join(" and ");
    const reason = `Recommended because ${item.creator.name} focuses heavily on ${topicsLabel}, which can reinforce your ${primaryMatch.name} signal (${primaryMatch.strength}/100) and aligns with your content goals.`;

    items.push({
      id: `disc-creator-${item.creator.id}-${dayIndex}`,
      title: item.creator.name,
      topicId: primaryMatch.id,
      topicName: primaryMatch.name,
      category: item.creator.topics.join(", "),
      type: "creator",
      stage: stageMeta.stage,
      difficulty: idx === 0 ? "foundational" : "intermediate",
      relevance: Math.min(100, Math.round(item.score / item.matchedInterests.length)),
      reason,
      action: "Follow",
      actionable: true,
      actionId,
      completed: isCompleted,
      creator: item.creator,
      guidance: generateGuidance("Follow", item.creator.name, primaryMatch.name, item.creator.platform),
    });
  });

  return items;
}

/**
 * Build deterministic Crossover recommendations (especially prominent on Day 6 or multi-interest blueprints).
 */
function buildCrossoverSuggestions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  filters: FeedFilter[],
  dayIndex: number,
  stageMeta: StageMeta,
  platform: TrainingPlatform
): DiscoveryItem[] {
  if (interests.length === 0) return [];

  const items: DiscoveryItem[] = [];
  const primary = interests[0];
  const secondary = interests[1] ?? interests[0];

  if (primary && secondary && primary.id !== secondary.id) {
    const crossoverTitle = `${primary.name} + ${secondary.name} applications`;
    const query = `${primary.name} with ${secondary.name}`;

    if (!isSuppressed(crossoverTitle, [primary.name, secondary.name], filters)) {
      const reason = `Recommended because Day 6 focuses on crossover synthesis, connecting your primary interest (${primary.name} at ${primary.strength}/100) with your secondary interest (${secondary.name} at ${secondary.strength}/100).`;

      items.push({
        id: `disc-crossover-${primary.id}-${secondary.id}-${dayIndex}`,
        title: crossoverTitle,
        topicId: primary.id,
        topicName: primary.name,
        subtopicId: secondary.id,
        subtopicName: secondary.name,
        type: "crossover",
        stage: stageMeta.stage,
        difficulty: "advanced",
        relevance: Math.min(100, Math.round((primary.strength + secondary.strength) / 2)),
        reason,
        action: "Search",
        actionable: true,
        searchQuery: query,
        relatedInterests: [primary.name, secondary.name],
        guidance: generateGuidance("Search", query, `${primary.name} & ${secondary.name}`, platform),
      });
    }
  } else if (primary) {
    // Single interest fallback: crossover between subtopics
    const topic = getDiscoveryTopic(primary.id);
    const subtopics = topic?.subtopics ?? [];
    if (subtopics.length >= 2) {
      const subA = subtopics[0];
      const subB = subtopics[1];
      const crossoverTitle = `${subA.name} & ${subB.name} Integration`;
      const query = `${primary.name} ${subA.name} ${subB.name}`;

      if (!isSuppressed(crossoverTitle, [primary.name, subA.name, subB.name], filters)) {
        items.push({
          id: `disc-crossover-${primary.id}-sub-${dayIndex}`,
          title: crossoverTitle,
          topicId: primary.id,
          topicName: primary.name,
          subtopicId: subA.id,
          subtopicName: subA.name,
          type: "crossover",
          stage: stageMeta.stage,
          difficulty: "intermediate",
          relevance: primary.strength,
          reason: `Recommended because combining ${subA.name} and ${subB.name} creates deeper mastery within your primary interest (${primary.name}).`,
          action: "Search",
          actionable: true,
          searchQuery: query,
          relatedInterests: [subA.name, subB.name],
          guidance: generateGuidance("Search", query, primary.name, platform),
        });
      }
    }
  }

  return items;
}

/**
 * Build deterministic Content Format and Subtopic exploration items.
 */
function buildFormatAndSubtopicItems(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  filters: FeedFilter[],
  dayIndex: number,
  stageMeta: StageMeta,
  platform: TrainingPlatform
): DiscoveryItem[] {
  if (interests.length === 0) return [];

  const items: DiscoveryItem[] = [];
  const topInterest = interests[0];
  const topic = getDiscoveryTopic(topInterest.id);
  const subtopics = topic?.subtopics ?? [];

  // Subtopic exploration
  subtopics.slice(0, 2).forEach((subtopic, idx) => {
    if (!isSuppressed(subtopic.name + " " + (subtopic.description ?? ""), [topInterest.name, subtopic.name], filters)) {
      items.push({
        id: `disc-subtopic-${topInterest.id}-${subtopic.id}-${dayIndex}`,
        title: subtopic.name,
        topicId: topInterest.id,
        topicName: topInterest.name,
        subtopicId: subtopic.id,
        subtopicName: subtopic.name,
        category: subtopic.description,
        type: "topic",
        stage: stageMeta.stage,
        difficulty: idx === 0 ? "foundational" : "intermediate",
        relevance: topInterest.strength,
        reason: `Recommended because exploring ${subtopic.name} builds topic depth in ${topInterest.name} (${topInterest.strength}/100).`,
        action: "Explore",
        actionable: true,
        guidance: generateGuidance("Explore", subtopic.name, topInterest.name, platform),
      });
    }
  });

  // Format recommendation based on content preference
  if (contentPreferences.length > 0) {
    const topFormat = contentPreferences[0];
    const formatTitle = `${topFormat.name} Focus for ${topInterest.name}`;
    const reason = `Recommended because you have a strong preference for ${topFormat.name.toLowerCase()} content (${topFormat.strength}/100). Prioritize this format to establish clearer algorithmic feedback.`;

    items.push({
      id: `disc-format-${topInterest.id}-${topFormat.id}-${dayIndex}`,
      title: formatTitle,
      topicId: topInterest.id,
      topicName: topInterest.name,
      type: "content",
      stage: stageMeta.stage,
      difficulty: "foundational",
      relevance: Math.min(100, Math.round((topInterest.strength + topFormat.strength) / 2)),
      reason,
      action: "Watch",
      actionable: true,
      contentTypes: [topFormat.id],
      guidance: generateGuidance("Watch", formatTitle, topInterest.name, platform),
    });
  }

  return items;
}

/**
 * Main entry point: Generate a complete, deterministic, personalized DiscoveryFeed.
 */
export function generatePersonalizedDiscovery(
  options: GenerateDiscoveryOptions
): DiscoveryFeed {
  const {
    blueprint,
    dayIndex = 0,
    completedActions = {},
    platform = "instagram",
  } = options;

  // Bound day index between 0 and 6
  const safeDayIndex = Math.max(0, Math.min(6, Math.floor(dayIndex)));
  const stageMeta = STAGE_CONFIG[safeDayIndex] ?? STAGE_CONFIG[0];

  const interests = extractInterests(blueprint);
  const contentPreferences = extractContentPreferences(blueprint);
  const filters = blueprint.suppressed ?? [];

  const searchPaths = buildSearchPaths(
    interests,
    contentPreferences,
    filters,
    safeDayIndex,
    stageMeta,
    platform,
    completedActions
  );

  const curatedCreators = buildCreatorRecommendations(
    interests,
    contentPreferences,
    filters,
    safeDayIndex,
    stageMeta,
    platform,
    completedActions
  );

  const crossoverSuggestions = buildCrossoverSuggestions(
    interests,
    contentPreferences,
    filters,
    safeDayIndex,
    stageMeta,
    platform
  );

  const formatRecommendations = buildFormatAndSubtopicItems(
    interests,
    contentPreferences,
    filters,
    safeDayIndex,
    stageMeta,
    platform
  );

  // Combine all items with balanced diversity
  const allItems: DiscoveryItem[] = [
    ...searchPaths,
    ...curatedCreators,
    ...crossoverSuggestions,
    ...formatRecommendations,
  ];

  // Sort combined items by relevance while preserving diversity
  allItems.sort((a, b) => b.relevance - a.relevance || a.title.localeCompare(b.title));

  return {
    dayIndex: safeDayIndex,
    stage: stageMeta.stage,
    stageTitle: stageMeta.stageTitle,
    stageGoal: stageMeta.stageGoal,
    items: allItems,
    searchPaths,
    curatedCreators,
    crossoverSuggestions,
    formatRecommendations,
  };
}