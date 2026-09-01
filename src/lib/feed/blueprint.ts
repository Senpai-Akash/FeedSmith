import { FeedPreferences, FeedPreference, ContentPreference, FeedFilter, SignalBlueprint } from "./types";
import { generateSignalSummary } from "./summary";

/**
 * Convert raw feed preferences into a deterministic SignalBlueprint.
 *
 * The algorithm is deliberately simple and does not rely on any external AI.
 * It follows these steps:
 *   1. Sort interests by descending strength.
 *   2. Take the first two interests as the primary set; the rest become secondary.
 *   3. Sort content preferences by descending strength.
 *   4. Preserve the list of filters as the suppressed topics.
 *   5. Compute an overall strength as the average of all interest strengths.
 *   6. Generate a human‑readable summary using the existing generateSignalSummary helper.
 */
export function generateSignalBlueprint(prefs: FeedPreferences): SignalBlueprint {
  const interests = [...(prefs.interests ?? [])].sort((a, b) => b.strength - a.strength);
  const primaryInterests: FeedPreference[] = interests.slice(0, 2);
  const secondaryInterests: FeedPreference[] = interests.slice(2);

  const contentPreferences = [...(prefs.contentPreferences ?? [])].sort(
    (a, b) => b.strength - a.strength,
  );

  const suppressed: FeedFilter[] = prefs.filters ?? [];

  const overallStrength = interests.length
    ? Math.round(interests.reduce((sum, i) => sum + i.strength, 0) / interests.length)
    : 0;

  const summary = generateSignalSummary(prefs);

  return {
    primaryInterests,
    secondaryInterests,
    contentPreferences,
    suppressed,
    overallStrength,
    summary,
  };
}
