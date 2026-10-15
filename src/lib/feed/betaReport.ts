/**
 * FeedSmith Local Beta Report Module
 *
 * Generates structured, versioned, privacy-respecting reports summarizing
 * a tester's evaluation findings, checklist statuses, failure notes,
 * and submitted product feedback.
 *
 * Privacy Guarantees:
 * - NO personal identity, location, email, or credentials exported.
 * - Diagnostic profile information is STRICTLY OPTIONAL and disabled by default.
 * - Ready for manual sharing by the tester directly with the developer.
 */

import { z } from "zod";
import {
  BetaChecklistState,
  calculateBetaChecklistMetrics,
  loadBetaChecklist,
  BETA_CHECKLIST_DEFINITIONS,
  BetaChecklistStatus,
} from "./betaChecklist";
import {
  loadProductFeedback,
  ProductFeedbackItem,
  ProductFeedbackItemSchema,
} from "./productFeedback";
import { loadPreferences } from "./preferences";
import { loadRawTrainingProgress } from "./dataManagement";

export const BETA_REPORT_SCHEMA_VERSION = 1;
export const APP_VERSION = "0.1.0-beta";

export interface BetaReportSummary {
  totalItems: number;
  passedCount: number;
  failedCount: number;
  unfinishedCount: number;
  completionPercent: number;
}

export interface BetaReportChecklistDetail {
  id: string;
  order: number;
  title: string;
  status: BetaChecklistStatus;
  note?: string;
  testedAt?: string;
}

export interface BetaReportDiagnostics {
  platform?: string;
  interestCount: number;
  suppressionCount: number;
  contentPreferenceCount: number;
  completedActionCount: number;
}

export interface BetaReportPayload {
  reportVersion: number;
  app: "FeedSmith";
  appVersion: string;
  generatedAt: string;
  summary: BetaReportSummary;
  checklist: BetaReportChecklistDetail[];
  productFeedback: ProductFeedbackItem[];
  diagnostics?: BetaReportDiagnostics;
}

export const BetaReportSummarySchema = z.object({
  totalItems: z.number().int().min(0),
  passedCount: z.number().int().min(0),
  failedCount: z.number().int().min(0),
  unfinishedCount: z.number().int().min(0),
  completionPercent: z.number().int().min(0).max(100),
});

export const BetaReportChecklistDetailSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  title: z.string(),
  status: z.enum(["not_tested", "passed", "failed"]),
  note: z.string().optional(),
  testedAt: z.string().optional(),
});

export const BetaReportDiagnosticsSchema = z.object({
  platform: z.string().optional(),
  interestCount: z.number().int().min(0),
  suppressionCount: z.number().int().min(0),
  contentPreferenceCount: z.number().int().min(0),
  completedActionCount: z.number().int().min(0),
});

export const BetaReportPayloadSchema = z.object({
  reportVersion: z.number().int().min(1),
  app: z.literal("FeedSmith"),
  appVersion: z.string(),
  generatedAt: z.string(),
  summary: BetaReportSummarySchema,
  checklist: z.array(BetaReportChecklistDetailSchema),
  productFeedback: z.array(ProductFeedbackItemSchema),
  diagnostics: BetaReportDiagnosticsSchema.optional(),
});

export interface GenerateBetaReportOptions {
  includeDiagnostics?: boolean;
  checklistState?: BetaChecklistState;
}

/**
 * Compiles a structured, validated beta report payload.
 */
export function generateBetaReport(options: GenerateBetaReportOptions = {}): BetaReportPayload {
  const checklistState = options.checklistState ?? loadBetaChecklist();
  const feedbackStore = loadProductFeedback();
  const metrics = calculateBetaChecklistMetrics(checklistState);

  const checklistDetails: BetaReportChecklistDetail[] = BETA_CHECKLIST_DEFINITIONS.map(def => {
    const itemState = checklistState.items[def.id];
    return {
      id: def.id,
      order: def.order,
      title: def.title,
      status: itemState?.status ?? "not_tested",
      note: itemState?.note,
      testedAt: itemState?.testedAt,
    };
  });

  let diagnostics: BetaReportDiagnostics | undefined;
  if (options.includeDiagnostics) {
    const prefs = loadPreferences();
    const progress = loadRawTrainingProgress();
    diagnostics = {
      platform: prefs.platform,
      interestCount: prefs.interests?.length ?? 0,
      suppressionCount: prefs.filters?.length ?? 0,
      contentPreferenceCount: prefs.contentPreferences?.length ?? 0,
      completedActionCount: Object.values(progress.completed ?? {}).filter(Boolean).length,
    };
  }

  const payload: BetaReportPayload = {
    reportVersion: BETA_REPORT_SCHEMA_VERSION,
    app: "FeedSmith",
    appVersion: APP_VERSION,
    generatedAt: new Date().toISOString(),
    summary: {
      totalItems: metrics.total,
      passedCount: metrics.passed,
      failedCount: metrics.failed,
      unfinishedCount: metrics.notTested,
      completionPercent: metrics.completionPercent,
    },
    checklist: checklistDetails,
    productFeedback: feedbackStore.items,
    diagnostics,
  };

  return payload;
}

/**
 * Validates any beta report structure.
 */
export function validateBetaReport(raw: unknown): {
  success: boolean;
  data?: BetaReportPayload;
  error?: string;
} {
  const parsed = BetaReportPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }
  return {
    success: true,
    data: parsed.data,
  };
}

