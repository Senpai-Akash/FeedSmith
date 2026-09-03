/*
 * Signal Intelligence Engine
 *
 * Deterministic logic that transforms raw Instagram analysis and user
 * preferences into structured intelligence: health score, content DNA,
 * priorities, suppression guidance, and a concise summary.
 */

import { SignalBlueprint, FeedPreference, ContentPreference, FeedFilter } from './types';

export interface IntelligenceResult {
  overallSignalHealth: IntelligenceHealth;
  contentDNA: ContentDNA;
  priorities: PriorityItem[];
  strongestSignals: { category: string; strength: number }[];
  weakestSignals: { category: string; strength: number }[];
  suppressionPriorities: SuppressionPriority[];
  recommendedFocusAreas: string[];
  intelligenceSummary: string;
}
export interface IntelligenceHealth {
  score: number; // 0‑100
  status: 'Excellent' | 'Strong' | 'Developing' | 'Weak' | 'Poor';
  explanation: string;
}
export interface ContentDNA {
  title: string;
  description: string;
  dominantThemes: string[];
}
export interface PriorityItem {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  direction: 'strengthen' | 'reduce';
  gap: number; // desired - current
  magnitude: number;
}
export interface SuppressionPriority {
  category: string;
  currentPresence: number;
  recommendedAction: string;
  priority: 'HIGH' | 'MEDIUM';
}
function getPriorityLevel(desired: number, current: number, delta: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const mag = Math.abs(delta);
  if (mag > 30 || desired > 80) return 'CRITICAL';
  if (mag > 20) return 'HIGH';
  if (mag > 10) return 'MEDIUM';
  return 'LOW';
}
function computeHealthScore(bp: SignalBlueprint, cur: Record<string, number>): number {
  const desiredVals = bp.primaryInterests.concat(bp.secondaryInterests).map(p => p.strength);
  const sumDesired = desiredVals.reduce((a, b) => a + b, 0);
  const sumCurrent = Object.values(cur).reduce((a, b) => a + b, 0);
  const ratio = sumDesired > 0 ? sumCurrent / sumDesired : 0;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}
function computeHealthLabel(sc: number): IntelligenceHealth['status'] {
  if (sc >= 90) return 'Excellent';
  if (sc >= 75) return 'Strong';
  if (sc >= 50) return 'Developing';
  if (sc >= 25) return 'Weak';
  return 'Poor';
}
export function generateIntelligence(
  blueprint: SignalBlueprint,
  currentSignal: Record<string, number>
): IntelligenceResult {
  // Map each interest id to desired strength
  const desiredMap: Record<string, number> = {};
  blueprint.primaryInterests.concat(blueprint.secondaryInterests).forEach(p => {
    desiredMap[p.id] = p.strength;
  });

  // Collect all categories for analysis
  const allCategories = new Set<string>();
  Object.keys(desiredMap).forEach(c => allCategories.add(c));
  Object.keys(currentSignal).forEach(c => allCategories.add(c));

  // Gather statistics
  const priorities: PriorityItem[] = [];
  const strongest: { category: string; strength: number }[] = [];
  const weakest: { category: string; strength: number }[] = [];

  for (const cat of allCategories) {
    const desired = desiredMap[cat] ?? 0;
    const current = currentSignal[cat] ?? 0;
    const delta = desired - current;
    const magnitude = Math.abs(delta);
    strongest.push({ category: cat, strength: current });
    weakest.push({ category: cat, strength: current });
    const level = getPriorityLevel(desired, current, delta);
    priorities.push({ level, category: cat, direction: delta > 0 ? 'strengthen' : 'reduce', gap: delta, magnitude: magnitude });
  }

  // Sort priorities by severity then magnitude, keep top 5
  const levelOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  priorities.sort((a, b) => (levelOrder[a.level] * 1000 + a.magnitude) - (levelOrder[b.level] * 1000 + b.magnitude));
  const topPriorities = priorities.slice(0, 5);

  // Suppression intelligence
  const suppressionPriorities: SuppressionPriority[] = [];
  blueprint.suppressed.forEach(supCat => {
    const curPresence = currentSignal[supCat] ?? 0;
    if (curPresence > 0) {
      suppressionPriorities.push({
        category: supCat,
        currentPresence: curPresence,
        recommendedAction: 'Reduce reinforcement',
        priority: curPresence > 50 ? 'HIGH' : 'MEDIUM',
      });
    }
  });

  // Content DNA generation
  const dominantThemes: string[] = [];
  blueprint.primaryInterests.slice(0, 3).forEach(p => dominantThemes.push(p.name));
  if (blueprint.contentPreferences && blueprint.contentPreferences.length > 0) {
    blueprint.contentPreferences.slice(0, 2).forEach(cp => dominantThemes.push(cp.name));
  }
  const contentDNA: ContentDNA = {
    title: dominantThemes.length
      ? `Focus on ${dominantThemes.slice(0, 2).join(' and ')}`
      : 'Broad interest profile',
    description: dominantThemes.length
      ? `FeedSmith recommends emphasizing ${dominantThemes.slice(0, 2).join(' and ')} to align your Instagram signal.`
      : 'Your preferences are currently undefined; consider adding interests to get started.',
    dominantThemes,
  };

  // Overall signal health
  const healthScore = computeHealthScore(blueprint, currentSignal);
  const healthStatus = computeHealthLabel(healthScore);
  const healthExplanation =
    healthStatus === 'Excellent'
      ? 'Your current content signal closely mirrors your desired interests.'
      : healthStatus === 'Strong'
      ? 'Your signal is largely aligned with your preferences.'
      : healthStatus === 'Developing'
      ? 'Your signal shows some alignment but key areas need attention.'
      : healthStatus === 'Weak'
      ? 'Your current signal diverges noticeably from what you want.'
      : 'Your signal is largely off‑track from your stated preferences.';

  const overallHealth: IntelligenceHealth = {
    score: healthScore,
    status: healthStatus,
    explanation: healthExplanation,
  };

  // Recommended focus areas (top strengthen directions)
  const recommendedFocusAreas: string[] = topPriorities
    .filter(p => p.direction === 'strengthen')
    .map(p => p.category)
    .slice(0, 3);

  // Generate concise deterministic summary
  const summaryParts = [
    `Signal health is ${healthStatus.toLowerCase()}.`,
    `Primary focus areas: ${topPriorities.slice(0, 2).map(p => p.category).join(' and ')}.`,
  ].filter(Boolean);
  if (suppressionPriorities.length > 0) {
    summaryParts.push(
      `Special attention needed for ${suppressionPriorities.slice(0, 2).map(s => `${s.category} (reduce)`).join(' and ')}.`
    );
  }
  const intelligenceSummary = summaryParts.join(' ');

  return {
    overallSignalHealth: overallHealth,
    contentDNA,
    priorities: topPriorities,
    strongestSignals: strongest.slice(0, 5),
    weakestSignals: weakest.slice(0, 5),
    suppressionPriorities,
    recommendedFocusAreas,
    intelligenceSummary,
  };
}
export const computeGapSummary = (
  blueprint: SignalBlueprint,
  currentSignal: Record<string, number>
) => {
  const desiredMap: Record<string, number> = {};
  blueprint.primaryInterests.concat(blueprint.secondaryInterests).forEach(p => {
    desiredMap[p.id] = p.strength;
  });
  const summary: Record<string, { desired: number; current: number }> = {};
  for (const cat in desiredMap) {
    summary[cat] = { desired: desiredMap[cat], current: currentSignal[cat] ?? 0 };
  }
  return summary;
};
// placeholder