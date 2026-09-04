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
}
