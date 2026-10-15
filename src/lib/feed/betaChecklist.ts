/**
 * FeedSmith Beta Testing Checklist Module
 *
 * Provides a structured, verifiable beta-testing workflow covering the 12 core
 * user journeys and feature boundaries.
 *
 * Guarantees:
 * - Local-first persistence.
 * - Explicit confirmation semantics (never auto-passes items).
 * - Isolated reset mechanism that leaves user preferences and progress intact.
 * - Captures detailed failure notes for developer evaluation.
 */

import { z } from "zod";

export const BETA_CHECKLIST_STORAGE_KEY = "feedsmith:betaChecklist:v1";
export const BETA_CHECKLIST_SCHEMA_VERSION = 1;

export type BetaChecklistStatus = "not_tested" | "passed" | "failed";

export interface BetaChecklistDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  suggestedRoute: string;
}

export const BETA_CHECKLIST_DEFINITIONS: BetaChecklistDefinition[] = [
  {
    id: "create_profile",
    order: 1,
    title: "1. Create a new signal profile",
    description: "Launch onboarding, define starting platform, and initiate profile configuration.",
    suggestedRoute: "/build",
  },
  {
    id: "configure_interests",
    order: 2,
    title: "2. Configure interests and content preferences",
    description: "Select core interest topics, adjust weight strengths, and choose preferred content formats.",
    suggestedRoute: "/build",
  },
  {
    id: "configure_suppression",
    order: 3,
    title: "3. Configure suppression filters",
    description: "Add negative filters or topics to avoid (e.g. clickbait, unrelated gossip).",
    suggestedRoute: "/build",
  },
  {
    id: "review_blueprint",
    order: 4,
    title: "4. Review the Signal Blueprint",
    description: "Inspect the generated Signal Blueprint summary, derived strength score, and topic distributions.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "inspect_daily_mission",
    order: 5,
    title: "5. Generate and inspect a daily mission",
    description: "Verify that Day 1 actions (Watch, Search, Follow, Engage, Avoid) are specific, relevant, and platform-tailored.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "manual_search_execution",
    order: 6,
    title: "6. Follow a suggested search or other action manually",
    description: "Copy a search query or review a platform playbook guide to verify concrete real-world utility.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "mark_action_completed",
    order: 7,
    title: "7. Mark an action as completed",
    description: "Toggle an action checkbox and verify progress percentage increments correctly.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "submit_recommendation_feedback",
    order: 8,
    title: "8. Submit recommendation feedback",
    description: "Rate an action or discovery query (+ More, 👍, - Less, 👎) and verify adaptive explanation banner updates.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "verify_persistence",
    order: 9,
    title: "9. Refresh the application and verify persistence",
    description: "Reload the page and verify that completed actions, feedback, and selected platform are accurately restored.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "training_transition",
    order: 10,
    title: "10. Complete or simulate a supported training transition",
    description: "Switch between day tabs (Day 1 through Day 7) and verify progressive stages (Seed, Broaden, Sharp, Pivot, Maintenance).",
    suggestedRoute: "/build/profile",
  },
  {
    id: "review_history_and_consistency",
    order: 11,
    title: "11. Review progress and training history",
    description: "Inspect Consistency Score, Days Completed, and Reinforced Topic Activity cards.",
    suggestedRoute: "/build/profile",
  },
  {
    id: "test_data_export_and_reset",
    order: 12,
    title: "12. Test data export and reset",
    description: "Open Data Settings, generate a backup JSON, validate it, and test clear-history or factory reset safely.",
    suggestedRoute: "/build/profile",
  },
];

export interface BetaChecklistItemState {
  id: string;
  status: BetaChecklistStatus;
  note?: string;
  testedAt?: string;
}

export interface BetaChecklistState {
  version: number;
  items: Record<string, BetaChecklistItemState>;
  updatedAt?: string;
}

export const BetaChecklistItemStateSchema = z.object({
  id: z.string(),
  status: z.enum(["not_tested", "passed", "failed"]),
  note: z.string().max(2000).optional(),
  testedAt: z.string().optional(),
});

export const BetaChecklistStateSchema = z.object({
  version: z.number().int().min(1).default(1),
  items: z.record(z.string(), BetaChecklistItemStateSchema).default({}),
  updatedAt: z.string().optional(),
});

/**
 * Initializes default checklist state with all 12 items marked as 'not_tested'.
 */
export function createDefaultBetaChecklistState(): BetaChecklistState {
  const items: Record<string, BetaChecklistItemState> = {};
  for (const def of BETA_CHECKLIST_DEFINITIONS) {
    items[def.id] = {
      id: def.id,
      status: "not_tested",
    };
  }
  return {
    version: BETA_CHECKLIST_SCHEMA_VERSION,
    items,
  };
}

/**
 * Loads beta checklist state safely from localStorage.
 */
export function loadBetaChecklist(): BetaChecklistState {
  const fallback = createDefaultBetaChecklistState();

  if (typeof localStorage === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(BETA_CHECKLIST_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;

    const items: Record<string, BetaChecklistItemState> = {};

    for (const def of BETA_CHECKLIST_DEFINITIONS) {
      const candidate = parsed.items?.[def.id];
      const status: BetaChecklistStatus =
        candidate?.status === "passed" || candidate?.status === "failed"
          ? candidate.status
          : "not_tested";

      const note = typeof candidate?.note === "string" ? candidate.note.slice(0, 2000) : undefined;
      const testedAt = typeof candidate?.testedAt === "string" ? candidate.testedAt : undefined;

      items[def.id] = {
        id: def.id,
        status,
        note,
        testedAt,
      };
    }

    return {
      version: BETA_CHECKLIST_SCHEMA_VERSION,
      items,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch (e) {
    console.warn("Failed to load beta checklist from localStorage, returning default.", e);
    return fallback;
  }
}

/**
 * Saves beta checklist state to localStorage.
 */
export function saveBetaChecklist(state: BetaChecklistState): void {
  if (typeof localStorage === "undefined") return;

  try {
    const clean: BetaChecklistState = {
      version: BETA_CHECKLIST_SCHEMA_VERSION,
      items: state.items,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(BETA_CHECKLIST_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error("Failed to save beta checklist", e);
  }
}

/**
 * Updates a single checklist item state.
 */
export function updateBetaChecklistItem(
  id: string,
  update: { status: BetaChecklistStatus; note?: string }
): BetaChecklistState {
  const state = loadBetaChecklist();
  const existing = state.items[id] || { id, status: "not_tested" };

  state.items[id] = {
    ...existing,
    status: update.status,
    note: update.status === "failed" ? update.note : undefined,
    testedAt: update.status !== "not_tested" ? new Date().toISOString() : undefined,
  };

  saveBetaChecklist(state);
  return state;
}

/**
 * Resets the beta checklist state to all 'not_tested' without touching user profile,
 * training history, or recommendation feedback.
 */
export function resetBetaChecklist(): BetaChecklistState {
  const blank = createDefaultBetaChecklistState();
  saveBetaChecklist(blank);
  return blank;
}

/**
 * Calculates summary metrics for the beta testing checklist.
 */
export function calculateBetaChecklistMetrics(state: BetaChecklistState): {
  total: number;
  passed: number;
  failed: number;
  notTested: number;
  completionPercent: number;
} {
  const values = Object.values(state.items);
  const total = BETA_CHECKLIST_DEFINITIONS.length;
  const passed = values.filter(i => i.status === "passed").length;
  const failed = values.filter(i => i.status === "failed").length;
  const notTested = total - (passed + failed);
  const completionPercent = total > 0 ? Math.round(((passed + failed) / total) * 100) : 0;

  return {
    total,
    passed,
    failed,
    notTested,
    completionPercent,
  };
}

