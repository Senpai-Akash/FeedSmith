export interface Interest {
  id: string;
  name: string;
}

export interface FeedPreference {
  id: string;
  name: string;
  strength: number; // 0-100
}

export interface FeedPreferences {
  interests: FeedPreference[];
}
