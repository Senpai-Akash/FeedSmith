import { FeedPreferences } from "./types";
import { FeedContent, RecommendedItem } from "./content";

/**
 * Helper to find a content‑style preference strength for a given content type.
 */
function getContentPreferenceStrength(
  prefs: FeedPreferences,
  contentType: string
): number {
  const cp = prefs.contentPreferences?.find(c => c.id === contentType);
  return cp ? cp.strength : 0;
}

/**
 * Compute a deterministic score (0‑100) for a piece of content based on the
 * supplied user preferences.
 *
 * Scoring strategy (simple and fully deterministic):
 *   1. Interest match – each interest that appears in the content adds its
 *      strength value to the raw score.
 *   2. Content‑type preference – the strength of the matching content style
 *      (if any) is added.
 *   3. The raw score is capped at 200 (max 100 from interests + 100 from
 *      content‑type) and then normalised to a 0‑100 integer.
 *   4. Reasons strings are assembled so the UI can explain the contribution.
 */
export function scoreContent(
  prefs: FeedPreferences,
  item: FeedContent
): RecommendedItem {
  const reasons: string[] = [];

  // ---------- Interest contribution ----------
  let interestScore = 0;
  const matchedInterests = prefs.interests?.filter(p => item.interests.includes(p.id)) ?? [];
  if (matchedInterests.length) {
    const parts = matchedInterests.map(p => {
      interestScore += p.strength;
      return `${p.name} (+${p.strength})`;
    });
    reasons.push(`Matches interests: ${parts.join(", ")}`);
  }

  // ---------- Content‑type contribution ----------
  const contentPrefStrength = getContentPreferenceStrength(prefs, item.contentType);
  if (contentPrefStrength) {
    const ctName = prefs.contentPreferences?.find(c => c.id === item.contentType)?.name ?? item.contentType;
    reasons.push(`Content type "${ctName}" preference (+${contentPrefStrength})`);
  }
  const rawScore = interestScore + contentPrefStrength;
  // Normalise to 0‑100 (max 200 raw). Round to nearest integer.
  const score = Math.min(100, Math.round((rawScore / 200) * 100));

  return { content: item, score, reasons };
}

/**
 * Main export – recommend a feed based on preferences and available content.
 * Items that match any of the user's filter tags are omitted.
 */
export function recommendFeed(
  preferences: FeedPreferences,
  content: FeedContent[]
): RecommendedItem[] {
  // Filter out items that the user explicitly wants to avoid.
  const filtered = content.filter(item => {
    if (!preferences.filters?.length) return true;
    const tags = item.filterTags ?? [];
    return !tags.some(tag => preferences.filters?.includes(tag));
  });

  const scored = filtered.map(item => scoreContent(preferences, item));
  // Sort descending by score, then by title for stability.
  scored.sort((a, b) => b.score - a.score || a.content.title.localeCompare(b.content.title));
  return scored;
}
