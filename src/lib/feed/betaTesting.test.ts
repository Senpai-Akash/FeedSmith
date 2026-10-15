import test from "node:test";
import assert from "node:assert/strict";

import {
  PRODUCT_FEEDBACK_CATEGORIES,
  createEmptyProductFeedbackStore,
  normalizeProductFeedbackItem,
  loadProductFeedback,
  saveProductFeedbackStore,
  submitProductFeedback,
  deleteProductFeedback,
  clearAllProductFeedback,
  PRODUCT_FEEDBACK_STORAGE_KEY,
} from "./productFeedback";

import {
  BETA_CHECKLIST_DEFINITIONS,
  createDefaultBetaChecklistState,
  loadBetaChecklist,
  saveBetaChecklist,
  updateBetaChecklistItem,
  resetBetaChecklist,
  calculateBetaChecklistMetrics,
  BETA_CHECKLIST_STORAGE_KEY,
} from "./betaChecklist";

import {
  generateBetaReport,
  validateBetaReport,
  APP_VERSION,
  BETA_REPORT_SCHEMA_VERSION,
} from "./betaReport";

import {
  exportFeedSmithData,
  validateImportData,
  importFeedSmithData,
  resetAllFeedSmithData,
} from "./dataManagement";

import { savePreferences } from "./preferences";

// Setup a mock localStorage environment for Node.js test runner
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Inject global localStorage if not present
if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: MockLocalStorage }).localStorage = new MockLocalStorage();
}

test("FEEDBACK: normalizeProductFeedbackItem handles valid inputs and rejects invalid categories", () => {
  const valid = normalizeProductFeedbackItem({
    category: "confusing_instructions",
    description: "The instructions on Day 2 were unclear.",
    rating: 4,
    route: "/build/profile",
  });

  assert.ok(valid);
  assert.equal(valid.category, "confusing_instructions");
  assert.equal(valid.description, "The instructions on Day 2 were unclear.");
  assert.equal(valid.rating, 4);
  assert.equal(valid.route, "/build/profile");
  assert.ok(valid.id.startsWith("pfb_"));
  assert.equal(valid.version, 1);

  // All 7 defined categories must be accepted
  for (const cat of PRODUCT_FEEDBACK_CATEGORIES) {
    const item = normalizeProductFeedbackItem({ category: cat });
    assert.ok(item, `Failed to normalize category: ${cat}`);
    assert.equal(item.category, cat);
  }

  // Invalid category must return null
  const invalid = normalizeProductFeedbackItem({ category: "non_existent_category" });
  assert.equal(invalid, null);

  // Invalid rating must be clamped or ignored
  const outOfRangeRating = normalizeProductFeedbackItem({
    category: "technical_issue",
    rating: 10,
  });
  assert.ok(outOfRangeRating);
  assert.equal(outOfRangeRating.rating, undefined);
});

test("FEEDBACK: submit, load, delete, and clear operations persist locally", () => {
  clearAllProductFeedback();

  // Initial load on empty storage
  const emptyStore = loadProductFeedback();
  assert.equal(emptyStore.items.length, 0);

  // Submit two items
  const item1 = submitProductFeedback({
    category: "navigation_difficulty",
    description: "Hard to find the export button.",
    rating: 2,
    route: "/build",
  });
  assert.ok(item1);

  const item2 = submitProductFeedback({
    category: "other_suggestion",
    description: "Add keyboard shortcuts.",
    rating: 5,
    route: "/build/profile",
  });
  assert.ok(item2);

  // Verify persistence
  const loaded = loadProductFeedback();
  assert.equal(loaded.items.length, 2);
  // Most recent first
  assert.equal(loaded.items[0].id, item2.id);
  assert.equal(loaded.items[1].id, item1.id);

  // Delete item 1
  const deleted = deleteProductFeedback(item1.id);
  assert.equal(deleted, true);

  const afterDelete = loadProductFeedback();
  assert.equal(afterDelete.items.length, 1);
  assert.equal(afterDelete.items[0].id, item2.id);

  // Clear all
  clearAllProductFeedback();
  assert.equal(loadProductFeedback().items.length, 0);
});

test("FEEDBACK: handles malformed localStorage safely without throwing", () => {
  localStorage.setItem(PRODUCT_FEEDBACK_STORAGE_KEY, "{ corrupted_json: true, broken }");
  const fallback = loadProductFeedback();
  assert.equal(fallback.version, 1);
  assert.equal(fallback.items.length, 0);

  // Recovery: can save new item over corrupted storage
  const item = submitProductFeedback({
    category: "confusing_instructions",
    description: "Recovered cleanly.",
  });
  assert.ok(item);
  assert.equal(loadProductFeedback().items.length, 1);
});

test("CHECKLIST: default state covers all 12 defined test items with 'not_tested' status", () => {
  const initial = createDefaultBetaChecklistState();
  assert.equal(BETA_CHECKLIST_DEFINITIONS.length, 12);
  assert.equal(Object.keys(initial.items).length, 12);

  for (const def of BETA_CHECKLIST_DEFINITIONS) {
    const item = initial.items[def.id];
    assert.ok(item, `Missing checklist item for ${def.id}`);
    assert.equal(item.status, "not_tested");
    assert.equal(item.note, undefined);
  }

  const metrics = calculateBetaChecklistMetrics(initial);
  assert.equal(metrics.total, 12);
  assert.equal(metrics.passed, 0);
  assert.equal(metrics.failed, 0);
  assert.equal(metrics.notTested, 12);
  assert.equal(metrics.completionPercent, 0);
});

test("CHECKLIST: updateBetaChecklistItem records passed and failed statuses with notes", () => {
  resetBetaChecklist();

  // Pass item 1
  updateBetaChecklistItem("create_profile", { status: "passed" });
  // Fail item 2 with failure note
  updateBetaChecklistItem("configure_interests", {
    status: "failed",
    note: "Slider does not respond to arrow keys on Firefox.",
  });

  const state = loadBetaChecklist();
  assert.equal(state.items["create_profile"].status, "passed");
  assert.ok(state.items["create_profile"].testedAt);

  assert.equal(state.items["configure_interests"].status, "failed");
  assert.equal(
    state.items["configure_interests"].note,
    "Slider does not respond to arrow keys on Firefox."
  );

  const metrics = calculateBetaChecklistMetrics(state);
  assert.equal(metrics.passed, 1);
  assert.equal(metrics.failed, 1);
  assert.equal(metrics.notTested, 10);
  assert.equal(metrics.completionPercent, 17); // 2 of 12 = 16.66% -> 17%
});

test("CHECKLIST: resetBetaChecklist resets only checklist without touching profile or feedback", () => {
  clearAllProductFeedback();
  resetBetaChecklist();

  // Set up user profile preferences
  savePreferences({
    interests: [{ id: "ai", name: "AI", strength: 80 }],
    filters: ["clickbait"],
    contentPreferences: [],
    platform: "youtube",
  });

  // Submit product feedback
  submitProductFeedback({
    category: "confusing_instructions",
    description: "Do not delete me on checklist reset.",
  });

  // Update checklist items
  updateBetaChecklistItem("review_blueprint", { status: "passed" });
  assert.equal(loadBetaChecklist().items["review_blueprint"].status, "passed");

  // Perform checklist reset
  const resetState = resetBetaChecklist();
  assert.equal(resetState.items["review_blueprint"].status, "not_tested");

  // Verify user preferences and product feedback remain intact!
  const exported = exportFeedSmithData();
  assert.equal(exported.preferences.interests.length, 1);
  assert.equal(exported.preferences.interests[0].id, "ai");
  assert.equal(exported.productFeedback?.items.length, 1);
  assert.equal(exported.productFeedback?.items[0].description, "Do not delete me on checklist reset.");
});

test("REPORT: generateBetaReport produces valid, versioned JSON report", () => {
  resetBetaChecklist();
  clearAllProductFeedback();

  // Record some checklist progress
  updateBetaChecklistItem("create_profile", { status: "passed" });
  updateBetaChecklistItem("inspect_daily_mission", {
    status: "failed",
    note: "Daily goal description wrapped onto 4 lines.",
  });

  // Submit a product feedback entry
  submitProductFeedback({
    category: "technical_issue",
    description: "Theme toggle flash.",
    rating: 3,
    route: "/feed",
  });

  // Generate report without diagnostics
  const report = generateBetaReport({ includeDiagnostics: false });
  assert.equal(report.app, "FeedSmith");
  assert.equal(report.appVersion, APP_VERSION);
  assert.equal(report.reportVersion, BETA_REPORT_SCHEMA_VERSION);
  assert.equal(report.summary.totalItems, 12);
  assert.equal(report.summary.passedCount, 1);
  assert.equal(report.summary.failedCount, 1);
  assert.equal(report.summary.unfinishedCount, 10);
  assert.equal(report.checklist.length, 12);
  assert.equal(report.productFeedback.length, 1);
  assert.equal(report.diagnostics, undefined);

  // Validate report structure
  const validation = validateBetaReport(report);
  assert.equal(validation.success, true);

  // Generate report with optional diagnostics
  const reportWithDiag = generateBetaReport({ includeDiagnostics: true });
  assert.ok(reportWithDiag.diagnostics);
  assert.equal(typeof reportWithDiag.diagnostics.interestCount, "number");
  assert.equal(typeof reportWithDiag.diagnostics.suppressionCount, "number");
  assert.equal(typeof reportWithDiag.diagnostics.completedActionCount, "number");

  const diagValidation = validateBetaReport(reportWithDiag);
  assert.equal(diagValidation.success, true);
});

test("DATA MANAGEMENT: export and import round-trip Product Feedback safely", () => {
  resetAllFeedSmithData();

  savePreferences({
    interests: [{ id: "photography", name: "Photography", strength: 90 }],
    filters: ["gossip"],
    contentPreferences: [],
    platform: "instagram",
  });

  submitProductFeedback({
    category: "missing_interests",
    description: "Please add Drone Photography.",
    rating: 4,
    route: "/build",
  });

  const payload = exportFeedSmithData();
  assert.ok(payload.productFeedback);
  assert.equal(payload.productFeedback.items.length, 1);
  assert.equal(payload.productFeedback.items[0].category, "missing_interests");

  // Validate import
  const validation = validateImportData(payload);
  assert.equal(validation.success, true);
  if (validation.success) {
    assert.equal(validation.data.productFeedback?.items.length, 1);
  }

  // Clear storage completely
  resetAllFeedSmithData();
  assert.equal(loadProductFeedback().items.length, 0);

  // Re-import
  importFeedSmithData(payload);
  const reloaded = loadProductFeedback();
  assert.equal(reloaded.items.length, 1);
  assert.equal(reloaded.items[0].description, "Please add Drone Photography.");

  // Full reset erases everything including product feedback
  resetAllFeedSmithData();
  assert.equal(loadProductFeedback().items.length, 0);
});
