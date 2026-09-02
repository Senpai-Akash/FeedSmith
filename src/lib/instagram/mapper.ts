import { InstagramAnalysis } from './types';

/**
 * Convert Instagram analysis signals into a simple category → score map.
 *
 * This keeps the mapping/business logic outside of React components.
 */
export function mapInstagramAnalysisToSignalMap(analysis: InstagramAnalysis): Record<string, number> {
  // Transform { [category]: InstagramContentSignal } into { [category]: score }
  const signalMap: Record<string, number> = {};
  for (const [category, signal] of Object.entries(analysis.signals)) {
    signalMap[category] = signal.score;
  }
  return signalMap;
}