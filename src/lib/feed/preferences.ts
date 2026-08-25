export type { Interest, FeedPreference, FeedPreferences } from "./types";

import { FeedPreferences } from "./types";

const STORAGE_KEY = "feedPreferences";

export function loadPreferences(): FeedPreferences {
  if (typeof window === "undefined") {
    return { interests: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { interests: [] };
    const parsed = JSON.parse(raw);
    return { interests: parsed.interests ?? [] };
  } catch (e) {
    console.error("Failed to load feed preferences", e);
    return { interests: [] };
  }
}

export function savePreferences(prefs: FeedPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to save feed preferences", e);
  }
}
