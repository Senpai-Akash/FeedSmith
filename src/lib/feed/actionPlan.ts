/** Action that FeedSmith recommends the user take on Instagram. */
export interface FeedAction {
  /** Unique identifier */
  id: string;
  /** Content category the action relates to */
  category: string;
  /** Direction of effort: either strengthen or reduce */
  direction: 'strengthen' | 'reduce';
  /** Numeric priority; higher = more important */
  priority: number;
  /** Short headline shown to the user */
  title: string;
  /** Longer explanatory text */
  description: string;
  /** Magnitude of change – used for sorting */
  magnitude?: number;
}