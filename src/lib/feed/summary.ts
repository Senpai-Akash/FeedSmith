import { FeedPreferences } from "./types";

/**
 * Generate a deterministic, human‑readable summary of a user's signal.
 * The logic is intentionally simple and does not rely on any ML.
 */
export function generateSignalSummary(prefs: FeedPreferences): string {
  const { interests = [], contentPreferences = [] } = prefs;

  const topInterests = [...interests]
    .sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))
    .slice(0, 2);

  const contentMap: Record<string, number> = {};
  for (const cp of contentPreferences) {
    contentMap[cp.id] = cp.strength;
  }
  const maxContent = Object.entries(contentMap).sort((a, b) => b[1] - a[1])[0];

  if (topInterests.length === 0) {
    return "Your signal is still empty. Add interests to begin building a feed training plan.";
  }

  const interestText = topInterests.map(i => i.name).join(" and ");
  let summary = `Your signal is strongest around ${interestText}.`;

  if (maxContent) {
    const [contentId, strength] = maxContent;
    const label = contentId === "educational" || contentId === "tutorials" ? "learning" : contentId === "entertainment" ? "entertainment" : "practical discovery";
    summary += ` ${strength >= 60 ? "You lean heavily" : "You also value"} ${label} content, which helps keep the plan consistent.`;
  }

  return summary;
}
