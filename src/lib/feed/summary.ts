import { FeedPreferences } from "./types";

/**
 * Generate a deterministic, human‑readable summary of a user's signal.
 * The logic is intentionally simple and does not rely on any ML.
 */
export function generateSignalSummary(prefs: FeedPreferences): string {
  const { interests = [], contentPreferences = [] } = prefs;

  // Determine dominant interest category if any technology‑related interest dominates.
  const techStrength = interests
    .filter(i => i.id === "ai" || i.id === "programming" || i.id === "cybersecurity" || i.id === "technology" || i.id === "space" || i.id === "startups")
    .reduce((sum, i) => sum + (i.strength ?? 0), 0);

  const totalInterestStrength = interests.reduce((sum, i) => sum + (i.strength ?? 0), 0);
  const techRatio = totalInterestStrength ? techStrength / totalInterestStrength : 0;

  // Determine dominant content style.
  const contentMap: Record<string, number> = {};
  for (const cp of contentPreferences) {
    contentMap[cp.id] = cp.strength;
  }
  const maxContentId = Object.entries(contentMap).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (techRatio > 0.5) {
    return "Your signal is strongly focused on technology and technical content.";
  }

  if (maxContentId === "educational" || maxContentId === "tutorials") {
    return "Your feed is tuned toward learning and practical content.";
  }

  if (maxContentId === "entertainment") {
    return "Your feed is tuned toward entertainment and discovery.";
  }

  // Fallback generic description.
  return "Your feed reflects a balanced mix of interests and content styles.";
}
