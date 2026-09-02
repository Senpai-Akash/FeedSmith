import { InstagramProfile, InstagramAnalysis, InstagramConnection } from './types';

/**
 * Mock Instagram client.
 * In production this would talk to the real Meta/Instagram API.
 * For now it returns deterministic mock data.
 */

let mockProfile: InstagramProfile = {
  username: 'demo_user',
  displayName: 'Demo User',
  profileImage: 'https://example.com/demo_profile.jpg',
  accountType: 'PERSONAL',
  connected: true,
  connectedAt: new Date().toISOString(),
  mode: 'MOCK',
};

let mockAnalysis: InstagramAnalysis = {
  profile: { ...mockProfile },
  signals: {
    AI: { category: 'AI', score: 34, sampleCount: 12 },
    Programming: { category: 'Programming', score: 18, sampleCount: 8 },
    Linux: { category: 'Linux', score: 9, sampleCount: 4 },
    Technology: { category: 'Technology', score: 27, sampleCount: 10 },
    Lifestyle: { category: 'Lifestyle', score: 71, sampleCount: 15 },
    Celebrity: { category: 'Celebrity', score: 64, sampleCount: 20 },
    Gaming: { category: 'Gaming', score: 38, sampleCount: 13 },
  },
  analyzedAt: new Date().toISOString(),
  overallScore: 37,
};

export async function getInstagramProfile(): Promise<InstagramProfile> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));
  return { ...mockProfile };
}

export async function getInstagramAnalysis(): Promise<InstagramAnalysis> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));
  return { ...mockAnalysis };
}

/**
 * In a real implementation this would check OAuth connection state.
 * For the mock we always consider the profile "connected".
 */
export function isInstagramConnected(): boolean {
  return mockProfile.connected;
}