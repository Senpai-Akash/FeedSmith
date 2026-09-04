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

const DEFAULT_PLATFORM: TrainingPlatform = "instagram";
const DAILY_WATCH_TARGETS = [13, 12, 12, 11, 12, 10, 9];
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
    goal: "Add more specific searches and finish useful content when it earns your attention.",
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

const CONTENT_LANGUAGE: Record<string, string> = {
  educational: "educational",
  entertainment: "entertaining",
  news: "news-focused",
  tutorials: "tutorial",
  discussions: "discussion-led",
};

function actionSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getAllInterests(blueprint: SignalBlueprint): FeedPreference[] {
  return [...blueprint.primaryInterests, ...blueprint.secondaryInterests]
    .filter(interest => interest.strength > 0)
    .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

function getContentPreferences(blueprint: SignalBlueprint): ContentPreference[] {
  return [...blueprint.contentPreferences]
    .filter(preference => preference.strength > 0)
    .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

function contentLabel(preference: ContentPreference | undefined): string {
  if (!preference) return "relevant";
  return CONTENT_LANGUAGE[preference.id] ?? preference.name.toLowerCase();
}

function allocateCounts(
  interests: FeedPreference[],
  total: number
): Record<string, number> {
  const strengthTotal = interests.reduce(
    (sum, interest) => sum + interest.strength,
    0
  );
  if (!strengthTotal) return {};

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

  while (assigned < total) {
    ordered[(assigned - allocations.length) % ordered.length].base += 1;
    assigned += 1;
  }

  while (assigned > total && ordered.some(item => item.base > 1)) {
    const reducible = [...ordered].reverse().find(item => item.base > 1);
    if (!reducible) break;
    reducible.base -= 1;
    assigned -= 1;
  }

  return Object.fromEntries(allocations.map(item => [item.id, item.base]));
}

function searchQueryFor(interest: FeedPreference, dayIndex: number): string {
  const suggestions = INTEREST_SEARCH_SUGGESTIONS[interest.id] ?? [
    `${interest.name} tutorials`,
    `${interest.name} explained`,
    `${interest.name} creators`,
  ];
  return suggestions[dayIndex % suggestions.length];
}

function creatorsFor(interest: FeedPreference): CreatorRecommendation[] {
  return INTEREST_CREATOR_CATALOG.filter(creator =>
    (creator.topics as readonly string[]).includes(interest.id)
  ).map(creator => ({
    ...creator,
    platform: creator.platform as TrainingPlatform,
    topics: [...creator.topics],
  }));
}

function creatorActionType(platform: TrainingPlatform): "FOLLOW" | "SUBSCRIBE" {
  return platform === "youtube" ? "SUBSCRIBE" : "FOLLOW";
}

function buildWatchActions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  dayIndex: number
): TrainingAction[] {
  const counts = allocateCounts(interests, DAILY_WATCH_TARGETS[dayIndex]);

  return interests.map((interest, index) => {
    const preferenceCount = Math.max(contentPreferences.length, 1);
    const contentPreference = contentPreferences[(dayIndex + index) % preferenceCount];
    const style = contentLabel(contentPreference);
    const contentPreferenceName = contentPreference?.name ?? "Relevant";
    const count = counts[interest.id] ?? 1;

    return {
      id: `day-${dayIndex + 1}-watch-${interest.id}`,
      type: "WATCH",
      title: `Watch ${count} ${interest.name} ${count === 1 ? "video" : "videos"}`,
      topic: interest.id,
      topicName: interest.name,
      count,
      contentType: contentPreference?.id ?? "relevant",
      contentPreferenceName,
      platform: DEFAULT_PLATFORM,
      description: `Watch ${count} ${style} ${interest.name.toLowerCase()} ${count === 1 ? "video" : "videos"}.`,
      why: `This reinforces ${interest.name} in proportion to your ${interest.strength}% interest strength.`,
    };
  });
}

function buildSearchActions(
  interests: FeedPreference[],
  dayIndex: number
): TrainingAction[] {
  const searchCount = Math.min(
    interests.length,
    dayIndex === 2 || dayIndex === 5 ? 3 : 2
  );

  return interests.slice(0, searchCount).map(interest => {
    const query = searchQueryFor(interest, dayIndex);

    return {
      id: `day-${dayIndex + 1}-search-${actionSlug(query)}`,
      type: "SEARCH",
      title: `Search "${query}"`,
      topic: interest.id,
      topicName: interest.name,
      query,
      platform: DEFAULT_PLATFORM,
      description: `Search "${query}" and choose results that genuinely match what you want more of.`,
      why: `Searches give the recommendation system a clearer active signal for ${interest.name}.`,
    };
  });
}

function buildCreatorActions(
  interests: FeedPreference[],
  dayIndex: number
): TrainingAction[] {
  if (![0, 1, 3, 4, 6].includes(dayIndex)) return [];

  const creatorTargets =
    dayIndex === 3 ? interests.slice(0, 3) : interests.slice(0, 2);

  return creatorTargets.flatMap((interest, interestIndex) => {
    const creators = creatorsFor(interest);
    const creator = creators[(dayIndex + interestIndex) % Math.max(creators.length, 1)];
    if (!creator) return [];

    const type = creatorActionType(creator.platform);

    return [
      {
        id: `day-${dayIndex + 1}-${type.toLowerCase()}-${creator.id}`,
        type,
        title: `${type === "SUBSCRIBE" ? "Subscribe to" : "Follow"} ${creator.name}`,
        topic: interest.id,
        topicName: interest.name,
        creator,
        description: `${type === "SUBSCRIBE" ? "Subscribe to" : "Follow"} ${creator.name} if you genuinely want more ${interest.name.toLowerCase()} content.`,
        why: creator.description,
      },
    ];
  });
}

function buildEngageActions(
  interests: FeedPreference[],
  contentPreferences: ContentPreference[],
  dayIndex: number
): TrainingAction[] {
  const topInterest = interests[0];
  const topContent = contentPreferences[0];
  const style = contentLabel(topContent);
  const topicText = topInterest ? `${topInterest.name.toLowerCase()} ` : "";

  const descriptions = [
    `Like or save ${style} ${topicText}content only when you genuinely want more of it.`,
    `Watch useful ${topicText}videos fully when they actually hold your attention.`,
    `Save practical ${style} posts you would want to revisit.`,
    "Open a few creator profiles before following so your signal stays intentional.",
    "Comment thoughtfully only when the conversation is genuinely relevant.",
    "Use skip or not interested when content pulls away from your chosen topics.",
    "Keep engagement natural: reinforce what you value, ignore what you do not.",
  ];

  return [
    {
      id: `day-${dayIndex + 1}-engage`,
      type: "ENGAGE",
      title: "Engage naturally",
      topic: topInterest?.id,
      topicName: topInterest?.name,
      description: descriptions[dayIndex],
      why: "FeedSmith gives you a training target, not an automation script. Quality engagement matters more than volume.",
    },
  ];
}

function buildAvoidActions(
  blueprint: SignalBlueprint,
  dayIndex: number
): TrainingAction[] {
  if (!blueprint.suppressed.length) return [];

  return blueprint.suppressed.map(filter => ({
    id: `day-${dayIndex + 1}-avoid-${actionSlug(filter)}`,
    type: "AVOID",
    title: `Avoid ${filter}`,
    filter,
    description: `Skip ${filter.toLowerCase()} so you do not reinforce content you do not want in your feed.`,
    why: "Avoiding unwanted categories reduces accidental reinforcement; FeedSmith does not block or remove them.",
  }));
}

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
      ...buildSearchActions(interests, dayIndex),
      ...buildCreatorActions(interests, dayIndex),
      ...buildEngageActions(interests, contentPreferences, dayIndex),
      ...buildAvoidActions(blueprint, dayIndex),
    ],
  }));

  return {
    platform,
    days,
  };
}
