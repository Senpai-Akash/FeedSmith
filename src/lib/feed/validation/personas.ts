import type { FeedPreferences } from "../types";

export interface TestPersona {
  id: string;
  name: string;
  description: string;
  profile: FeedPreferences;
}

/**
 * Standard test personas representing diverse user profiles.
 * Designed according to Milestone validation specifications.
 */
export const PERSONA_A: TestPersona = {
  id: "persona-a",
  name: "Software Development",
  description: "Developer profile focusing on AI, Programming, and Linux with tutorial/educational preferences.",
  profile: {
    interests: [
      { id: "ai", name: "AI", strength: 90 },
      { id: "programming", name: "Programming", strength: 85 },
      { id: "linux", name: "Linux", strength: 70 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials", strength: 85 },
      { id: "educational", name: "Educational content", strength: 80 },
    ],
    filters: ["Celebrity gossip", "Clickbait"],
  },
};

export const PERSONA_B: TestPersona = {
  id: "persona-b",
  name: "Fitness",
  description: "Active lifestyle profile focusing on Running, Strength Training, and Nutrition.",
  profile: {
    interests: [
      { id: "fitness", name: "Fitness", strength: 88 },
      { id: "strength-training", name: "Strength training", strength: 82 },
      { id: "nutrition", name: "Nutrition", strength: 76 },
    ],
    contentPreferences: [
      { id: "demonstrations", name: "Demonstrations", strength: 85 },
      { id: "educational", name: "Educational content", strength: 75 },
    ],
    filters: ["Unrelated celebrity content"],
  },
};

export const PERSONA_C: TestPersona = {
  id: "persona-c",
  name: "Gaming",
  description: "Gamer profile focused on FPS games, hardware, and analysis across gameplay, tutorials, and reviews.",
  profile: {
    interests: [
      { id: "gaming", name: "Gaming", strength: 92 },
      { id: "gaming-hardware", name: "Gaming hardware", strength: 80 },
      { id: "game-analysis", name: "Game analysis", strength: 74 },
    ],
    contentPreferences: [
      { id: "gameplay", name: "Gameplay", strength: 90 },
      { id: "tutorials", name: "Tutorials", strength: 80 },
      { id: "reviews", name: "Reviews", strength: 75 },
    ],
    filters: ["Unrelated promotional content"],
  },
};

export const PERSONA_D: TestPersona = {
  id: "persona-d",
  name: "Animals and Photography",
  description: "Creative & lifestyle profile interested in Cats, Wildlife, and Photography.",
  profile: {
    interests: [
      { id: "cats", name: "Cats", strength: 90 },
      { id: "wildlife", name: "Wildlife", strength: 80 },
      { id: "photography", name: "Photography", strength: 75 },
    ],
    contentPreferences: [
      { id: "entertainment", name: "Entertaining", strength: 85 },
      { id: "educational", name: "Educational", strength: 80 },
      { id: "demonstrations", name: "Visual demonstrations", strength: 70 },
    ],
    filters: ["Unrelated clickbait"],
  },
};

export const PERSONA_E: TestPersona = {
  id: "persona-e",
  name: "Single Interest",
  description: "Single strong primary interest with minimal secondary interests; verifies no artificial variety is forced.",
  profile: {
    interests: [
      { id: "ai", name: "AI", strength: 95 },
    ],
    contentPreferences: [
      { id: "educational", name: "Educational content", strength: 80 },
    ],
    filters: ["Clickbait"],
  },
};

export const PERSONA_F: TestPersona = {
  id: "persona-f",
  name: "Many Interests",
  description: "Diverse profile with 6 interests of varying strengths; verifies proportional allocation and priority.",
  profile: {
    interests: [
      { id: "ai", name: "AI", strength: 95 },
      { id: "programming", name: "Programming", strength: 90 },
      { id: "gaming", name: "Gaming", strength: 65 },
      { id: "fitness", name: "Fitness", strength: 50 },
      { id: "music", name: "Music", strength: 35 },
      { id: "photography", name: "Photography", strength: 20 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials", strength: 85 },
    ],
    filters: ["Spam"],
  },
};

export const PERSONA_G: TestPersona = {
  id: "persona-g",
  name: "Conflicting Preferences",
  description: "Profile where user preferences conflict with suppression filters (e.g. interest is also filtered).",
  profile: {
    interests: [
      { id: "cats", name: "Cats", strength: 85 },
      { id: "gaming", name: "Gaming", strength: 80 },
    ],
    contentPreferences: [
      { id: "tutorials", name: "Tutorials", strength: 70 },
    ],
    filters: ["Cats", "Gaming hardware", "Clickbait"],
  },
};

export const PERSONA_H: TestPersona = {
  id: "persona-h",
  name: "Empty or Partial Profile",
  description: "Incomplete profile with empty interests and preferences; verifies system stability and zero fabrication.",
  profile: {
    interests: [],
    contentPreferences: [],
    filters: [],
  },
};

export const ALL_TEST_PERSONAS: TestPersona[] = [
  PERSONA_A,
  PERSONA_B,
  PERSONA_C,
  PERSONA_D,
  PERSONA_E,
  PERSONA_F,
  PERSONA_G,
  PERSONA_H,
];

