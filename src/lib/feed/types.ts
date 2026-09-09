export interface Interest {
  id: string;
  name: string;
  /**
   * A broad category used for later signal summarisation.
   * Not required for the current UI but makes the model flexible for future algorithms.
   */
  category?: string;
}

export interface FeedPreference {
  id: string;
  name: string;
  strength: number; // 0-100
}

/**
 * Represents a content‑style preference such as "Educational" or "Entertainment".
 * Each has a strength between 0 and 100.
 */
export interface ContentPreference {
  id: string; // e.g. "educational"
  name: string; // display name
  strength: number; // 0‑100
}

/**
 * Simple string identifiers for filters that the user wants to avoid.
 */
export type FeedFilter = string;

export interface FeedPreferences {
  interests: FeedPreference[];
  /** Optional content‑style preferences */
  contentPreferences?: ContentPreference[];
  /** Optional list of filter identifiers the user wants to avoid */
  filters?: FeedFilter[];
}

/**
 * Blueprint representing the deterministic signal derived from a user's preferences.
 * It categorises interests into primary and secondary groups, includes content style
 * preferences, suppressed topics, an overall strength metric and a human‑readable
 * summary. This shape is used on the profile page to give the user a concise view of
 * their configuration before any Instagram integration.
 */
export interface SignalBlueprint {
  /** Strongest interests – by default the top two by strength */
  primaryInterests: FeedPreference[];
  /** Remaining interests after the primary ones */
  secondaryInterests: FeedPreference[];
  /** Content‑type preferences, sorted by strength */
  contentPreferences: ContentPreference[];
  /** List of filter identifiers the user wishes to suppress */
  suppressed: FeedFilter[];
  /** Overall signal strength – average of interest strengths (0‑100) */
  overallStrength: number;
  /** Human‑readable description of the signal */
  summary: string;
}

export type TrainingPlatform = "instagram" | "youtube" | "tiktok";

export type TrainingActionType =
  | "WATCH"
  | "SEARCH"
  | "FOLLOW"
  | "SUBSCRIBE"
  | "ENGAGE"
  | "AVOID";

export interface CreatorRecommendation {
  id: string;
  name: string;
  platform: TrainingPlatform;
  topics: string[];
  url?: string;
  description: string;
}

export interface TrainingActionBase {
  id: string;
  type: TrainingActionType;
  title: string;
  description: string;
  why: string;
}

export interface WatchTrainingAction extends TrainingActionBase {
  type: "WATCH";
  topic: string;
  topicName: string;
  count: number;
  contentType: string;
  contentPreferenceName: string;
  platform: TrainingPlatform;
}

export interface SearchTrainingAction extends TrainingActionBase {
  type: "SEARCH";
  topic: string;
  topicName: string;
  query: string;
  platform: TrainingPlatform;
}

export interface CreatorTrainingAction extends TrainingActionBase {
  type: "FOLLOW" | "SUBSCRIBE";
  topic: string;
  topicName: string;
  creator: CreatorRecommendation;
}

export interface EngageTrainingAction extends TrainingActionBase {
  type: "ENGAGE";
  topic?: string;
  topicName?: string;
}

export interface AvoidTrainingAction extends TrainingActionBase {
  type: "AVOID";
  filter: FeedFilter;
}

export type TrainingAction =
  | WatchTrainingAction
  | SearchTrainingAction
  | CreatorTrainingAction
  | EngageTrainingAction
  | AvoidTrainingAction;

export interface FeedTrainingDay {
  day: number;
  stage:
    | "ESTABLISH"
    | "REINFORCE"
    | "STRENGTHEN"
    | "EXPAND"
    | "DEEPEN"
    | "REFINE"
    | "MAINTAIN";
  goal: string;
  actions: TrainingAction[];
}

export interface FeedTrainingPlan {
  platform: TrainingPlatform;
  days: FeedTrainingDay[];
  summary: string;
}

/**
 * Discovery Library Types
 */

/**
 * Represents a search query for a topic at a specific specificity level.
 */
export interface DiscoverySearchQuery {
  query: string;
  /** "broad", "specific", or "discovery" */
  specificity: "broad" | "specific" | "discovery";
  /** Optional: subtopic this query is focused on */
  subtopic?: string;
  /** Preferred content types for this search */
  contentTypes?: string[];
}

/**
 * Represents a subtopic within a larger interest context.
 * Example: Python, React, Data Structures under Programming.
 */
export interface DiscoverySubtopic {
  id: string;
  name: string;
  description?: string;
  /** Related topic IDs */
  related?: string[];
}

/**
 * Discovery topic with structured search queries and related content.
 */
export interface DiscoveryTopic {
  /** Topic ID, typically matches interest ID */
  id: string;
  name: string;
  description?: string;
  /** Related subtopics */
  subtopics: DiscoverySubtopic[];
  /** Search queries organized by specificity */
  searches: DiscoverySearchQuery[];
  /** Content types typical for this topic */
  contentTypes: string[];
}

/**
 * Priority classification for interests and content preferences.
 * Used to determine how prominently an item should be featured.
 */
export type PriorityLevel = "core" | "strong" | "supporting" | "secondary";

/**
 * Training intensity for a given day.
 * Affects the number of actions and their complexity.
 */
export type TrainingIntensity = "high" | "moderate" | "maintenance";

/**
 * Represents an interest with its priority classification.
 */
export interface ClassifiedInterest extends FeedPreference {
  priority: PriorityLevel;
}

/**
 * Represents a content preference with its priority classification.
 */
export interface ClassifiedContentPreference extends ContentPreference {
  priority: PriorityLevel;
}
