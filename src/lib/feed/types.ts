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
