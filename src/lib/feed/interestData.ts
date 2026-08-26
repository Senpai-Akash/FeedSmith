/**
 * Centralised list of available interests.
 * Each interest has an id, display name, and optional broad category.
 * The list is deliberately kept simple and easy to extend.
 */
export const INTERESTS = [
  { id: "ai", name: "AI", category: "technology" },
  { id: "programming", name: "Programming", category: "technology" },
  { id: "cybersecurity", name: "Cybersecurity", category: "technology" },
  { id: "technology", name: "Technology", category: "technology" },
  { id: "design", name: "Design", category: "creative" },
  { id: "science", name: "Science", category: "science" },
  { id: "gaming", name: "Gaming", category: "entertainment" },
  { id: "business", name: "Business", category: "business" },
  { id: "music", name: "Music", category: "entertainment" },
  { id: "fitness", name: "Fitness", category: "lifestyle" },
  { id: "photography", name: "Photography", category: "creative" },
  { id: "movies", name: "Movies", category: "entertainment" },
  { id: "travel", name: "Travel", category: "lifestyle" },
  { id: "space", name: "Space", category: "science" },
  { id: "startups", name: "Startups", category: "business" },
] as const;

export type Interest = typeof INTERESTS[number];
