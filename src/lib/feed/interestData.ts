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
  { id: "cats", name: "Cats", category: "lifestyle" },
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

export const INTEREST_SEARCH_SUGGESTIONS: Record<string, string[]> = {
  ai: [
    "artificial intelligence basics",
    "machine learning tutorials",
    "AI tools for developers",
    "neural networks explained",
    "AI research discussions",
  ],
  programming: [
    "Python programming",
    "coding tutorials",
    "web development",
    "data structures",
    "software engineering tips",
    "JavaScript projects",
  ],
  cybersecurity: [
    "cybersecurity basics",
    "web security tutorials",
    "ethical hacking labs",
    "privacy protection tips",
  ],
  technology: [
    "new technology explained",
    "consumer tech reviews",
    "future technology",
    "tech industry analysis",
  ],
  cats: [
    "cute cats",
    "cat behavior",
    "cat care tips",
    "funny cats",
    "kitten rescue stories",
  ],
  design: [
    "UI design tutorials",
    "visual design principles",
    "product design process",
    "typography tips",
  ],
  science: [
    "science explainers",
    "physics basics",
    "biology discoveries",
    "science experiments",
  ],
  gaming: [
    "indie game development",
    "game reviews",
    "gaming discussions",
    "game design analysis",
  ],
  business: [
    "business strategy",
    "market analysis",
    "entrepreneurship lessons",
    "business case studies",
  ],
  music: [
    "music theory basics",
    "songwriting tips",
    "music production tutorials",
    "artist interviews",
  ],
  fitness: [
    "home workout routines",
    "strength training basics",
    "mobility exercises",
    "nutrition tips",
  ],
  photography: [
    "photography tutorials",
    "portrait lighting",
    "street photography tips",
    "camera settings explained",
  ],
  movies: [
    "film analysis",
    "movie reviews",
    "cinematography breakdown",
    "director interviews",
  ],
  travel: [
    "travel guides",
    "budget travel tips",
    "city walks",
    "local food travel",
  ],
  space: [
    "space discoveries",
    "astronomy basics",
    "rocket launches",
    "James Webb telescope images",
  ],
  startups: [
    "startup lessons",
    "founder interviews",
    "product market fit",
    "SaaS growth strategy",
  ],
};

export const INTEREST_CREATOR_CATALOG = [
  {
    id: "freecodecamp",
    name: "freeCodeCamp.org",
    platform: "youtube",
    topics: ["programming", "ai", "technology"],
    url: "https://www.youtube.com/@freecodecamp",
    description: "Long-form programming courses and practical developer tutorials.",
  },
  {
    id: "traversy-media",
    name: "Traversy Media",
    platform: "youtube",
    topics: ["programming", "technology"],
    url: "https://www.youtube.com/@TraversyMedia",
    description: "Web development tutorials, project builds, and developer guidance.",
  },
  {
    id: "fireship",
    name: "Fireship",
    platform: "youtube",
    topics: ["programming", "ai", "technology"],
    url: "https://www.youtube.com/@Fireship",
    description: "Concise programming explainers and modern tech breakdowns.",
  },
  {
    id: "the-net-ninja",
    name: "The Net Ninja",
    platform: "youtube",
    topics: ["programming"],
    url: "https://www.youtube.com/@NetNinja",
    description: "Structured web development lessons and coding series.",
  },
  {
    id: "jackson-galaxy",
    name: "Jackson Galaxy",
    platform: "youtube",
    topics: ["cats"],
    url: "https://www.youtube.com/@JacksonGalaxy",
    description: "Cat behavior education and practical cat-care advice.",
  },
  {
    id: "kitten-lady",
    name: "Kitten Lady",
    platform: "youtube",
    topics: ["cats"],
    url: "https://www.youtube.com/@KittenLady",
    description: "Kitten rescue, cat welfare, and care education.",
  },
  {
    id: "cole-and-marmalade",
    name: "Cole and Marmalade",
    platform: "youtube",
    topics: ["cats"],
    url: "https://www.youtube.com/@ColeAndMarmalade",
    description: "Cat-centered videos with education, rescue, and light entertainment.",
  },
  {
    id: "kurzgesagt",
    name: "Kurzgesagt",
    platform: "youtube",
    topics: ["science", "space", "technology"],
    url: "https://www.youtube.com/@kurzgesagt",
    description: "Animated science explainers and big-picture technology topics.",
  },
  {
    id: "ali-abdaal",
    name: "Ali Abdaal",
    platform: "youtube",
    topics: ["business", "startups"],
    url: "https://www.youtube.com/@aliabdaal",
    description: "Creator business, productivity, and thoughtful work systems.",
  },
] as const;
