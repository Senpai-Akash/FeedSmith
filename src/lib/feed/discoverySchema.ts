/**
 * TypeScript schema definitions for the discovery catalog using Zod.
 *
 * The FeedSmith discovery engine relies on a deterministic, well‑structured
 * catalog of topics, subtopics, search queries and creators.  While the runtime
 * code already assumes the shape of `DISCOVERY_TOPICS`, having an explicit
 * validation schema provides two important benefits:
 *   1. Guarantees at build‑time that the catalog adheres to the expected model.
 *   2. Enables runtime checks (e.g. during CI) to catch accidental drift when
 *      editing the large `DISCOVERY_TOPICS` object.
 *
 * Zod is already a dependency of the project (used in other modules), so we can
 * safely import it without adding new packages.
 */

import { z } from "zod";

/** Sub‑topic definition */
export const DiscoverySubtopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  related: z.array(z.string()).optional(),
});

/** Creator entry that can be recommended for a topic */
export const DiscoveryCreatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.enum(["instagram", "youtube", "tiktok"]),
  topics: z.array(z.string()),
  url: z.string().url().optional(),
  description: z.string(),
});

/** Individual search query used by the discovery engine */
export const DiscoverySearchQuerySchema = z.object({
  query: z.string(),
  specificity: z.enum(["broad", "specific", "discovery"]),
  contentTypes: z.array(z.string()).optional(),
  subtopic: z.string().optional(),
});

/** Top‑level discovery topic definition */
export const DiscoveryTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).optional(),
  description: z.string().optional(),
  relatedTopics: z.array(z.string()).optional(),
  creators: z.array(DiscoveryCreatorSchema).optional(),
  subtopics: z.array(DiscoverySubtopicSchema).optional(),
  searches: z.array(DiscoverySearchQuerySchema),
  contentTypes: z.array(z.string()).optional(),
});

/** The entire discovery library – a record keyed by topic id */
export const DiscoveryLibrarySchema = z.record(z.string(),DiscoveryTopicSchema);

// Export TypeScript types inferred from the schemas for use elsewhere.
// Exported TypeScript types with distinct names to avoid colliding with the
// similarly‑named interfaces defined in `types.ts`.
export type DiscoverySubtopicSchema = z.infer<typeof DiscoverySubtopicSchema>;
export type DiscoveryCreatorSchema = z.infer<typeof DiscoveryCreatorSchema>;
export type DiscoverySearchQuerySchema = z.infer<typeof DiscoverySearchQuerySchema>;
export type DiscoveryTopicSchema = z.infer<typeof DiscoveryTopicSchema>;
export type DiscoveryLibrarySchema = z.infer<typeof DiscoveryLibrarySchema>;
