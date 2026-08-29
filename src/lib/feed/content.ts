/**
 * Feed content model used by the recommendation engine.
 *
 * The shape purposefully mirrors a typical article/video/post record so
 * that it can be replaced later with a real API response without changing
 * the scoring logic.
 */
export interface FeedContent {
  /** Unique identifier */
  id: string;
  /** Short headline */
  title: string;
  /** Longer description or excerpt */
  description: string;
  /** Broad category – e.g. "Technology", "Science" – used for UI grouping */
  category: string;
  /** List of interest ids (the same ids used in Interest / FeedPreference) that the content is about */
  interests: string[];
  /** Content‑type identifier – matches the ids from ContentPreference (e.g. "tutorials", "educational") */
  contentType: string;
  /** Optional image URL – can be a local asset or remote placeholder */
  image?: string;
  /** Source or author name */
  source?: string;
  /** Optional free‑form metadata */
  metadata?: Record<string, unknown>;
  /** Identifiers that map to user filters; when any of these appear in the user's filter list the item is removed */
  filterTags?: string[];
}

/**
 * Result item returned from the recommendation engine.
 */
export interface RecommendedItem {
  content: FeedContent;
  /** Integer 0‑100 representing how well the item matches the user signal */
  score: number;
  /** Human‑readable reasons that contributed to the score */
  reasons: string[];
}
