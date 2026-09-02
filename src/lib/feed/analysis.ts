import { SignalBlueprint, FeedPreference, ContentPreference, FeedFilter } from './types';
import { InstagramAnalysis } from '@/lib/instagram/types';
import { FeedAction } from './actionPlan';

/**
 * Utility functions for analysing the gap between the Signal Blueprint
 * and Instagram's current signal.
 *
 * All logic is deterministic and pure – no side-effects.
 */

/**
 * Calculate a numeric difference for a given category.
 * Positive means the desired strength is higher than current.
 * Negative means it should be reduced.
 */
function getCategoryDelta(desired: number, current: number): number {
  return desired - current;
}

/**
 * Build an ordered list of actions that FeedSmith recommends.
 *
 * The algorithm:
 *   1. For each desired category compute delta.
 *   2. Prioritise actions by absolute delta (larger = higher priority).
 *   3. Generate a human‑readable title & description.
 *   4. Assign a direction ("strengthen" | "reduce").
 *
 * The result is a deterministic action plan.
 */
export function generateActionPlan(
  blueprint: SignalBlueprint,
  currentSignal: Record<string, number>
): FeedAction[] {
  // Build a map of desired strength per category
  const desiredMap: Record<string, number> = {};
  blueprint.primaryInterests.forEach(pref => {
    desiredMap[pref.id] = pref.strength;
  });
  // Secondary interests are also relevant
  blueprint.secondaryInterests.forEach(pref => {
    desiredMap[pref.id] = pref.strength;
  });

  // Build a list of all actions
  const actions: FeedAction[] = [];

  // Process desired categories
  for (const [category, desiredStrength] of Object.entries(desiredMap)) {
    const currentStrength = currentSignal[category] ?? 0;
    const delta = getCategoryDelta(desiredStrength, currentStrength);

    const direction = delta > 0 ? 'strengthen' : 'reduce';
    const magnitude = Math.abs(delta);

    // Priority is higher for larger magnitude
    const priority = Math.min(5, Math.ceil(magnitude / 10)); // 1‑5 scale

    // Human‑readable strings
    const title = `${direction[0].toUpperCase()}${direction.slice(1)} ${category}`;
    const description =
      delta > 0
        ? `Boost your engagement with ${category}-focused content to increase its strength.`
        : `Tone down interaction with ${category} to reduce its influence.`;

    actions.push({
      id: `action-${category}`,
      category,
      direction: direction as 'strengthen' | 'reduce',
      priority,
      magnitude,
      title,
      description,
    });
  }

  // Identify suppressed categories (high current but not desired)
  const desiredCategories = new Set(Object.keys(desiredMap));
  for (const [category, currentStrength] of Object.entries(currentSignal)) {
    if (!desiredCategories.has(category) && currentStrength > 20) {
      // Add a generic reduce action for suppressed topics
      actions.push({
        id: `action-suppressed-${category}`,
        category,
        direction: 'reduce',
        priority: 3,
         magnitude: 0,
        title: `Limit ${category}`,
        description: `Avoid engaging with ${category} content to keep it from dominating your feed.`,
      });
    }
  }

  // Sort by priority descending, then by delta magnitude descending
   actions.sort((a, b) => {
     const priorityDiff = b.priority - a.priority;
     return priorityDiff !== 0 ? priorityDiff : (b.magnitude ?? 0) - (a.magnitude ?? 0);
   });

  return actions;
}

/**
 * Helper to compute a simple gap summary used for UI display.
 *
 * Returns an object with desired vs current values for each category.
 */
export function computeGapSummary(
  blueprint: SignalBlueprint,
  currentSignal: Record<string, number>
) {
  const desiredMap: Record<string, number> = {};
  blueprint.primaryInterests.concat(blueprint.secondaryInterests).forEach(pref => {
    desiredMap[pref.id] = pref.strength;
  });

  const summary: Record<string, {desired: number; current: number}> = {};
  for (const category in desiredMap) {
    summary[category] = {
      desired: desiredMap[category],
      current: currentSignal[category] ?? 0,
    };
  }
  return summary;
}