export interface InstagramProfile {
  /** Username handle */
  username: string;
  /** Display name */
  displayName: string;
  /** Profile image URL */
  profileImage: string;
  /** Account type, e.g. PERSONAL or BUSINESS */
  accountType: 'PERSONAL' | 'BUSINESS' | 'CREATOR';
  /** Whether the connection is active */
  connected: boolean;
  /** When the connection was established */
  connectedAt?: string;
  /** Connection mode (e.g. MOCK, LIVE) */
  mode?: 'MOCK' | 'LIVE';
}

export interface InstagramContentSignal {
  /** Category label, e.g. 'AI', 'Programming' */
  category: string;
  /** Score representing strength or relevance */
  score: number;
  /** Approximate sample count used for analysis */
  sampleCount?: number;
}

export interface InstagramAnalysis {
  /** Primary profile information */
  profile: InstagramProfile;
  /** Mapping of content categories to signals */
  signals: Record<string, InstagramContentSignal>;
  /** Timestamp of analysis */
  analyzedAt: string;
  /** Overall aggregated score (0-100) */
  overallScore: number;
}

export interface InstagramConnection {
  /** Whether Instagram is currently connected */
  connected: boolean;
  /** Username of connected account */
  username: string;
  /** When connection was established */
  connectedAt: string;
  /** Connection mode */
  mode: 'MOCK' | 'LIVE';
}