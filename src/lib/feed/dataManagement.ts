/**
 * FeedSmith Data Management & Migration Module
 *
 * Provides safe, local-first data export, import validation, schema checking,
 * history-only clearing, and full data reset operations.
 *
 * Guarantees:
 * - Deterministic JSON export format with versioning.
 * - Strict schema validation rejecting corrupted, malicious, or incompatible payloads.
 * - Explicit confirmation semantics preventing silent data loss.
 * - Safe error handling without crashing or exposing sensitive data.
 */

import { z } from "zod";
import {
  FeedPreferences,
  FeedbackMeta,
} from "./types";
import {
  loadPreferences,
  savePreferences,
  normalizePreferences,
} from "./preferences";
import {
  loadTrainingHistoryMeta,
  saveTrainingHistoryMeta,
  clearTrainingHistoryMeta,
  type TrainingHistoryMeta,
} from "./history";
import {
  loadUserFeedbackMeta,
  saveUserFeedbackMeta,
  clearUserFeedbackMeta,
} from "./feedback";
import {
  loadProductFeedback,
  saveProductFeedbackStore,
  clearAllProductFeedback,
  ProductFeedbackStoreSchema,
  type ProductFeedbackStore,
} from "./productFeedback";

export const EXPORT_SCHEMA_VERSION = 1;

export const PROGRESS_STORAGE_KEY = "feedTrainingProgress";
export const PREFERENCES_STORAGE_KEY = "feedPreferences";

export interface FeedSmithExportPayload {
  version: number;
  exportedAt: string;
  app: "FeedSmith";
  preferences: FeedPreferences;
  progress: {
    planKey: string;
    completed: Record<string, boolean>;
  };
  historyMeta: TrainingHistoryMeta;
  feedbackMeta: FeedbackMeta;
  productFeedback?: ProductFeedbackStore;
}

/**
 * Zod validation schema for imported payloads.
 */
const FeedPreferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  strength: z.number().min(0).max(100),
});

const ContentPreferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  strength: z.number().min(0).max(100),
});

const PreferencesSchema = z.object({
  interests: z.array(FeedPreferenceSchema),
  contentPreferences: z.array(ContentPreferenceSchema).optional().default([]),
  filters: z.array(z.string()).optional().default([]),
  platform: z.enum(["instagram", "youtube", "tiktok"]).optional(),
});

const ProgressSchema = z.object({
  planKey: z.string().optional().default(""),
  completed: z.record(z.string(), z.boolean()).optional().default({}),
});

const HistoryMetaSchema = z.object({
  version: z.literal(1).optional().default(1),
  startedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  days: z.array(
    z.object({
      day: z.number(),
      startedAt: z.string().optional(),
      completedAt: z.string().optional(),
    })
  ).optional().default([]),
});

const FeedbackItemSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  topicId: z.string(),
  topicName: z.string().optional(),
  subtopicId: z.string().optional(),
  subtopicName: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  value: z.enum(["MORE", "LESS", "USEFUL", "NOT_USEFUL"]),
  timestamp: z.string(),
  trainingDay: z.number().optional().default(1),
});

const FeedbackMetaSchema = z.object({
  version: z.literal(1).optional().default(1),
  updatedAt: z.string().optional(),
  items: z.array(FeedbackItemSchema).optional().default([]),
});

export const ExportPayloadSchema = z.object({
  version: z.number().int().min(1),
  exportedAt: z.string(),
  app: z.literal("FeedSmith").optional().default("FeedSmith"),
  preferences: PreferencesSchema,
  progress: ProgressSchema.optional().default({ planKey: "", completed: {} }),
  historyMeta: HistoryMetaSchema.optional().default({ version: 1, days: [] }),
  feedbackMeta: FeedbackMetaSchema.optional().default({ version: 1, items: [] }),
  productFeedback: ProductFeedbackStoreSchema.optional(),
});

export type ValidationResult =
  | { success: true; data: FeedSmithExportPayload }
  | { success: false; error: string };

/**
 * Loads training progress from localStorage safely.
 */
export function loadRawTrainingProgress(): { planKey: string; completed: Record<string, boolean> } {
  if (typeof localStorage === "undefined") {
    return { planKey: "", completed: {} };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { planKey: "", completed: {} };
    const parsed = JSON.parse(raw);
    return {
      planKey: typeof parsed?.planKey === "string" ? parsed.planKey : "",
      completed: typeof parsed?.completed === "object" && parsed.completed ? parsed.completed : {},
    };
  } catch {
    return { planKey: "", completed: {} };
  }
}

/**
 * Saves raw progress to localStorage.
 */
export function saveRawTrainingProgress(progress: { planKey: string; completed: Record<string, boolean> }): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save training progress", e);
  }
}

/**
 * Clears raw training progress.
 */
export function clearRawTrainingProgress(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear training progress", e);
  }
}

/**
 * Generates a complete export payload from local storage.
 */
export function exportFeedSmithData(): FeedSmithExportPayload {
  const preferences = loadPreferences();
  const progress = loadRawTrainingProgress();
  const historyMeta = loadTrainingHistoryMeta();
  const feedbackMeta = loadUserFeedbackMeta();
  const productFeedback = loadProductFeedback();

  return {
    version: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: "FeedSmith",
    preferences,
    progress,
    historyMeta,
    feedbackMeta,
    productFeedback,
  };
}

/**
 * Validates arbitrary input data for import.
 */
export function validateImportData(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { success: false, error: "Invalid data: Expected a JSON object." };
  }

  const result = ExportPayloadSchema.safeParse(raw);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const pathStr = firstIssue ? firstIssue.path.join(".") : "unknown";
    const msg = firstIssue ? firstIssue.message : "Schema validation failed";
    return {
      success: false,
      error: `Validation error at "${pathStr}": ${msg}`,
    };
  }

  const valid = result.data;
  return {
    success: true,
    data: {
      version: valid.version,
      exportedAt: valid.exportedAt,
      app: "FeedSmith",
      preferences: normalizePreferences(valid.preferences),
      progress: {
        planKey: valid.progress.planKey,
        completed: valid.progress.completed,
      },
      historyMeta: valid.historyMeta,
      feedbackMeta: valid.feedbackMeta as FeedbackMeta,
      productFeedback: valid.productFeedback,
    },
  };
}

/**
 * Applies validated data into localStorage.
 */
export function importFeedSmithData(data: FeedSmithExportPayload): void {
  savePreferences(data.preferences);
  saveRawTrainingProgress(data.progress);
  saveTrainingHistoryMeta(data.historyMeta);
  saveUserFeedbackMeta(data.feedbackMeta);
  if (data.productFeedback) {
    saveProductFeedbackStore(data.productFeedback);
  }
}

/**
 * Clears only training progress and history/feedback, preserving user interests & filters.
 */
export function clearTrainingHistoryOnly(): void {
  clearRawTrainingProgress();
  clearTrainingHistoryMeta();
  clearUserFeedbackMeta();
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem("feedsmith:firstDayStarted");
    } catch {}
  }
}

/**
 * Performs a complete reset of all FeedSmith data.
 */
export function resetAllFeedSmithData(): void {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      localStorage.removeItem("feedsmith:firstDayStarted");
    } catch {}
  }
  clearTrainingHistoryMeta();
  clearUserFeedbackMeta();
  clearAllProductFeedback();
}
