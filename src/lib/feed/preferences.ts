export type { Interest, FeedPreference, FeedPreferences } from "./types";

import { FeedPreferences, FeedPreference, ContentPreference, FeedFilter } from "./types";

const STORAGE_KEY = "feedPreferences";

function sanitizeNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

function normalizeInterest(raw: unknown): FeedPreference | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Partial<FeedPreference>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  if (!id || !name) return null;

  return {
    id,
    name,
    strength: sanitizeNumber(candidate.strength),
  };
}

function normalizeContentPreference(raw: unknown): ContentPreference | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Partial<ContentPreference>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  if (!id || !name) return null;

  return {
    id,
    name,
    strength: sanitizeNumber(candidate.strength),
  };
}

function normalizeFilters(raw: unknown): FeedFilter[] {
  if (!Array.isArray(raw)) return [];

  return [...new Set(
    raw
      .map(value => (typeof value === "string" ? value.trim() : String(value ?? "").trim()))
      .filter(Boolean)
  )];
}

export function normalizePreferences(raw: unknown): FeedPreferences {
  if (!raw || typeof raw !== "object") {
    return { interests: [], contentPreferences: [], filters: [] };
  }

  const candidate = raw as Partial<FeedPreferences>;

  const interests = Array.isArray(candidate.interests)
    ? candidate.interests
        .map(item => normalizeInterest(item))
        .filter((item): item is FeedPreference => Boolean(item))
    : [];

  const contentPreferences = Array.isArray(candidate.contentPreferences)
    ? candidate.contentPreferences
        .map(item => normalizeContentPreference(item))
        .filter((item): item is ContentPreference => Boolean(item))
    : [];

  const filters = normalizeFilters(candidate.filters);

  return {
    interests: Array.from(new Map(interests.map(item => [item.id, item])).values()).sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name)),
    contentPreferences: Array.from(new Map(contentPreferences.map(item => [item.id, item])).values()).sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name)),
    filters,
  };
}

export function loadPreferences(): FeedPreferences {
  if (typeof window === "undefined") {
    return { interests: [], contentPreferences: [], filters: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { interests: [], contentPreferences: [], filters: [] };
    return normalizePreferences(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to load feed preferences", error);
    return { interests: [], contentPreferences: [], filters: [] };
  }
}

export function savePreferences(prefs: FeedPreferences): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePreferences(prefs)));
  } catch (error) {
    console.error("Failed to save feed preferences", error);
  }
}
