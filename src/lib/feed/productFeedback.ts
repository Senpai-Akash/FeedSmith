/**
 * FeedSmith Product Feedback Module
 *
 * Distinct from Recommendation Feedback (which tunes algorithm weights),
 * Product Feedback captures whether FeedSmith itself is understandable,
 * useful, confusing, frustrating, or experiencing technical problems.
 *
 * Privacy & Architecture Guarantees:
 * - 100% local-first storage (localStorage).
 * - Never transmits data to an external server or telemetry service.
 * - Collects ZERO personally identifiable information (no names, emails, IPs, or device fingerprints).
 * - Schema-versioned and resilient to corrupted or missing storage.
 */

import { z } from "zod";

export const PRODUCT_FEEDBACK_STORAGE_KEY = "feedsmith:productFeedback:v1";
export const PRODUCT_FEEDBACK_SCHEMA_VERSION = 1;

export const PRODUCT_FEEDBACK_CATEGORIES = [
  "confusing_instructions",
  "irrelevant_recommendations",
  "too_many_actions",
  "missing_interests",
  "navigation_difficulty",
  "technical_issue",
  "other_suggestion",
] as const;

export type ProductFeedbackCategory = (typeof PRODUCT_FEEDBACK_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductFeedbackCategory, string> = {
  confusing_instructions: "Confusing Instructions",
  irrelevant_recommendations: "Irrelevant Recommendations",
  too_many_actions: "Too Many Actions",
  missing_interests: "Missing Interests or Categories",
  navigation_difficulty: "Difficulty Navigating",
  technical_issue: "Technical Issue / Bug",
  other_suggestion: "General Suggestion",
};

export interface ProductFeedbackItem {
  id: string;
  category: ProductFeedbackCategory;
  description?: string;
  rating?: number; // 1-5 scale
  route?: string; // e.g. "/build", "/build/profile"
  createdAt: string;
  version: number;
}

export interface ProductFeedbackStore {
  version: number;
  items: ProductFeedbackItem[];
  updatedAt?: string;
}

export const ProductFeedbackItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(PRODUCT_FEEDBACK_CATEGORIES),
  description: z.string().max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  route: z.string().max(200).optional(),
  createdAt: z.string().min(1),
  version: z.number().int().min(1).default(1),
});

export const ProductFeedbackStoreSchema = z.object({
  version: z.number().int().min(1).default(1),
  items: z.array(ProductFeedbackItemSchema).default([]),
  updatedAt: z.string().optional(),
});

/**
 * Creates an empty Product Feedback store.
 */
export function createEmptyProductFeedbackStore(): ProductFeedbackStore {
  return {
    version: PRODUCT_FEEDBACK_SCHEMA_VERSION,
    items: [],
  };
}

/**
 * Normalizes a raw feedback item safely, returning null if invalid.
 */
export function normalizeProductFeedbackItem(raw: unknown): ProductFeedbackItem | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  const categoryStr = typeof candidate.category === "string" ? candidate.category.trim() : "";
  if (!PRODUCT_FEEDBACK_CATEGORIES.includes(categoryStr as ProductFeedbackCategory)) {
    return null;
  }

  const category = categoryStr as ProductFeedbackCategory;
  const id = typeof candidate.id === "string" && candidate.id.trim()
    ? candidate.id.trim()
    : `pfb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let rating: number | undefined;
  if (typeof candidate.rating === "number" && Number.isFinite(candidate.rating)) {
    const rounded = Math.round(candidate.rating);
    if (rounded >= 1 && rounded <= 5) {
      rating = rounded;
    }
  }

  const description = typeof candidate.description === "string" && candidate.description.trim()
    ? candidate.description.trim().slice(0, 2000)
    : undefined;

  const route = typeof candidate.route === "string" && candidate.route.trim()
    ? candidate.route.trim().slice(0, 200)
    : undefined;

  const createdAt = typeof candidate.createdAt === "string" && candidate.createdAt.trim()
    ? candidate.createdAt.trim()
    : new Date().toISOString();

  const version = typeof candidate.version === "number" && Number.isFinite(candidate.version)
    ? Math.round(candidate.version)
    : PRODUCT_FEEDBACK_SCHEMA_VERSION;

  return {
    id,
    category,
    description,
    rating,
    route,
    createdAt,
    version,
  };
}

/**
 * Safely loads all stored product feedback items from localStorage.
 */
export function loadProductFeedback(): ProductFeedbackStore {
  if (typeof localStorage === "undefined") {
    return createEmptyProductFeedbackStore();
  }

  try {
    const raw = localStorage.getItem(PRODUCT_FEEDBACK_STORAGE_KEY);
    if (!raw) return createEmptyProductFeedbackStore();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return createEmptyProductFeedbackStore();
    }

    const rawItems: unknown[] = Array.isArray(parsed.items) ? parsed.items : [];
    const items: ProductFeedbackItem[] = rawItems
      .map((item: unknown) => normalizeProductFeedbackItem(item))
      .filter((item: ProductFeedbackItem | null): item is ProductFeedbackItem => item !== null);

    return {
      version: PRODUCT_FEEDBACK_SCHEMA_VERSION,
      items,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch (e) {
    console.warn("Failed to read product feedback from localStorage; returning empty store.", e);
    return createEmptyProductFeedbackStore();
  }
}

/**
 * Saves the product feedback store to localStorage.
 */
export function saveProductFeedbackStore(store: ProductFeedbackStore): void {
  if (typeof localStorage === "undefined") return;

  try {
    const clean: ProductFeedbackStore = {
      version: PRODUCT_FEEDBACK_SCHEMA_VERSION,
      items: store.items,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PRODUCT_FEEDBACK_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error("Failed to save product feedback store", e);
  }
}

/**
 * Submits a new product feedback entry.
 */
export function submitProductFeedback(input: {
  category: ProductFeedbackCategory;
  description?: string;
  rating?: number;
  route?: string;
}): ProductFeedbackItem | null {
  const normalized = normalizeProductFeedbackItem({
    ...input,
    id: `pfb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    version: PRODUCT_FEEDBACK_SCHEMA_VERSION,
  });

  if (!normalized) return null;

  const store = loadProductFeedback();
  store.items.unshift(normalized); // Most recent first
  saveProductFeedbackStore(store);

  return normalized;
}

/**
 * Deletes a product feedback entry by id.
 */
export function deleteProductFeedback(id: string): boolean {
  if (!id) return false;
  const store = loadProductFeedback();
  const initialLength = store.items.length;
  store.items = store.items.filter(item => item.id !== id);
  if (store.items.length !== initialLength) {
    saveProductFeedbackStore(store);
    return true;
  }
  return false;
}

/**
 * Clears all product feedback.
 */
export function clearAllProductFeedback(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(PRODUCT_FEEDBACK_STORAGE_KEY);
  } catch {}
}

