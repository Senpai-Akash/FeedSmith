import { FeedbackMeta, FeedbackValue, UserFeedback } from "./types";

export const FEEDBACK_STORAGE_KEY = "feedTrainingFeedback:v1";

const VALID_FEEDBACK_VALUES = new Set<FeedbackValue>([
  "MORE",
  "LESS",
  "USEFUL",
  "NOT_USEFUL",
]);

/**
 * Creates an empty FeedbackMeta structure.
 */
export function createFeedbackMeta(): FeedbackMeta {
  return {
    version: 1,
    items: [],
  };
}

/**
 * Normalizes a raw feedback value to a valid FeedbackValue or null.
 */
export function normalizeFeedbackValue(value: unknown): FeedbackValue | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase().trim() as FeedbackValue;
  return VALID_FEEDBACK_VALUES.has(upper) ? upper : null;
}

/**
 * Normalizes a raw object into a valid UserFeedback or null if invalid.
 */
export function normalizeUserFeedback(raw: unknown): UserFeedback | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Partial<UserFeedback>;
  const actionId = typeof candidate.actionId === "string" ? candidate.actionId.trim() : "";
  const topicId = typeof candidate.topicId === "string" ? candidate.topicId.trim() : "";
  const val = normalizeFeedbackValue(candidate.value);

  if (!actionId || !topicId || !val) {
    return null;
  }

  const rawDay = Number(candidate.trainingDay);
  const trainingDay = Number.isFinite(rawDay) && rawDay >= 1 && rawDay <= 7 ? Math.round(rawDay) : 1;
  const timestamp = typeof candidate.timestamp === "string" && candidate.timestamp.trim()
    ? candidate.timestamp.trim()
    : new Date().toISOString();

  const id = typeof candidate.id === "string" && candidate.id.trim()
    ? candidate.id.trim()
    : `fb-${actionId}-${topicId}`;

  return {
    id,
    actionId,
    topicId,
    topicName: typeof candidate.topicName === "string" ? candidate.topicName.trim() : undefined,
    subtopicId: typeof candidate.subtopicId === "string" ? candidate.subtopicId.trim() : undefined,
    subtopicName: typeof candidate.subtopicName === "string" ? candidate.subtopicName.trim() : undefined,
    category: typeof candidate.category === "string" ? candidate.category.trim() : undefined,
    type: candidate.type,
    value: val,
    timestamp,
    trainingDay,
  };
}

/**
 * Safely normalizes full FeedbackMeta structure.
 */
export function normalizeFeedbackMeta(raw: unknown): FeedbackMeta {
  if (!raw || typeof raw !== "object") {
    return createFeedbackMeta();
  }

  const candidate = raw as Partial<FeedbackMeta>;
  if (candidate.version !== 1) {
    return createFeedbackMeta();
  }

  const items = Array.isArray(candidate.items)
    ? candidate.items
        .map(normalizeUserFeedback)
        .filter((item): item is UserFeedback => item !== null)
    : [];

  return {
    version: 1,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : undefined,
    items,
  };
}

/**
 * Loads feedback from localStorage with graceful fallback for malformed or missing data.
 */
export function loadUserFeedbackMeta(): FeedbackMeta {
  if (typeof window === "undefined") {
    return createFeedbackMeta();
  }

  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return createFeedbackMeta();

    const parsed = JSON.parse(raw) as unknown;
    return normalizeFeedbackMeta(parsed);
  } catch (error) {
    console.error("Failed to load user feedback", error);
    return createFeedbackMeta();
  }
}

/**
 * Saves feedback to localStorage safely.
 */
export function saveUserFeedbackMeta(meta: FeedbackMeta): void {
  if (typeof window === "undefined") return;

  try {
    const safeMeta: FeedbackMeta = {
      ...normalizeFeedbackMeta(meta),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(safeMeta));
  } catch (error) {
    console.error("Failed to save user feedback", error);
  }
}

/**
 * Clears user feedback from localStorage.
 */
export function clearUserFeedbackMeta(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear user feedback", error);
  }
}

/**
 * Adds or updates a user feedback entry in the meta collection.
 */
export function recordFeedback(
  currentMeta: FeedbackMeta,
  input: Omit<UserFeedback, "id" | "timestamp"> & { id?: string; timestamp?: string }
): { meta: FeedbackMeta; feedback: UserFeedback } {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const id = input.id ?? `fb-${input.actionId}-${input.topicId}`;

  const entry: UserFeedback = {
    ...input,
    id,
    timestamp,
  };

  const normalizedEntry = normalizeUserFeedback(entry);
  if (!normalizedEntry) {
    return { meta: currentMeta, feedback: entry };
  }

  const existingIndex = currentMeta.items.findIndex(
    item => item.actionId === normalizedEntry.actionId
  );

  let updatedItems: UserFeedback[];
  if (existingIndex >= 0) {
    updatedItems = [...currentMeta.items];
    updatedItems[existingIndex] = normalizedEntry;
  } else {
    updatedItems = [...currentMeta.items, normalizedEntry];
  }

  const updatedMeta: FeedbackMeta = {
    version: 1,
    updatedAt: timestamp,
    items: updatedItems,
  };

  return {
    meta: updatedMeta,
    feedback: normalizedEntry,
  };
}

/**
 * Removes feedback associated with an actionId.
 */
export function removeFeedback(
  currentMeta: FeedbackMeta,
  actionId: string
): FeedbackMeta {
  const updatedItems = currentMeta.items.filter(item => item.actionId !== actionId);
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: updatedItems,
  };
}

/**
 * Helper to retrieve feedback for a specific actionId.
 */
export function getFeedbackForAction(
  meta: FeedbackMeta,
  actionId: string
): UserFeedback | undefined {
  return meta.items.find(item => item.actionId === actionId);
}

export type { FeedbackMeta, UserFeedback, FeedbackValue } from "./types";

// Re-export adaptive engine utilities for convenience
export {
  calculateDerivedSignal,
  buildSignalJourney,
  computeStatusLabel,
  computeSubtopicStatusLabel,
  scoreTopicWithFeedback,
  rankDiscoveryWithFeedback,
} from "./adaptiveEngine";

