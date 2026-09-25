/**
 * First-run experience detection and utilities.
 * 
 * Tracks user progression through:
 * 1. Landing (understand FeedSmith)
 * 2. Build (define signal)
 * 3. Review (see blueprint)
 * 4. Training (complete daily missions)
 */

/**
 * Check if this is first day of training (should show blueprint review)
 */
export function shouldShowBlueprintReview(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const dayStarted = localStorage.getItem("feedsmith:firstDayStarted");
    return !dayStarted;
  } catch {
    return false;
  }
}

/**
 * Mark that first day of training has started
 */
export function confirmFirstDayStarted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("feedsmith:firstDayStarted", new Date().toISOString());
  } catch (e) {
    console.error("Failed to mark first day as started", e);
  }
}

/**
 * Get user's current stage in first-run flow
 */
export function getCurrentStage() {
  if (typeof window === "undefined") return "unknown";

  try {
    const dayStarted = localStorage.getItem("feedsmith:firstDayStarted");
    if (!dayStarted) return "reviewing"; // User has built, should review
    return "training"; // User is actively training
  } catch {
    return "unknown";
  }
}

