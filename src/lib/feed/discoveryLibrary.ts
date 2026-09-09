import { DiscoveryTopic } from "./types";

/**
 * Curated Discovery Library
 *
 * This file contains structured knowledge about interests, subtopics, search queries,
 * and content types. It enables the training engine to make specific,
 * actionable recommendations instead of generic instructions.
 *
 * Design principles:
 * - Quality over quantity
 * - Based on real subtopic domains
 * - Organized by search specificity (broad → specific → discovery)
 * - Deterministic and maintainable
 */

export const DISCOVERY_TOPICS: Record<string, DiscoveryTopic> = {
  programming: {
    id: "programming",
    name: "Programming",
    description: "Software development, coding, and programming languages",
    subtopics: [
      {
        id: "web-development",
        name: "Web Development",
        description: "Frontend, backend, and full-stack web technologies",
        related: ["javascript", "react", "python"],
      },
      {
        id: "python",
        name: "Python",
        description: "Python programming language and ecosystem",
        related: ["data-science", "web-development"],
      },
      {
        id: "javascript",
        name: "JavaScript",
        description: "JavaScript and TypeScript for web and beyond",
        related: ["web-development", "react"],
      },
      {
        id: "react",
        name: "React",
        description: "React library for building user interfaces",
        related: ["javascript", "web-development"],
      },
      {
        id: "data-structures",
        name: "Data Structures & Algorithms",
        description: "Foundational computer science concepts",
        related: ["python", "interviews"],
      },
      {
        id: "open-source",
        name: "Open Source",
        description: "Contributing to and maintaining open source projects",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "programming", specificity: "broad" },
      { query: "software development", specificity: "broad" },
      { query: "coding tutorials", specificity: "broad" },
      // Specific
      { query: "Python programming", specificity: "specific", subtopic: "python" },
      { query: "JavaScript tutorials", specificity: "specific", subtopic: "javascript" },
      { query: "React tutorials", specificity: "specific", subtopic: "react" },
      { query: "web development projects", specificity: "specific", subtopic: "web-development" },
      { query: "data structures explained", specificity: "specific", subtopic: "data-structures" },
      // Discovery
      { query: "Python async programming patterns", specificity: "discovery", subtopic: "python" },
      { query: "React performance optimization", specificity: "discovery", subtopic: "react" },
      { query: "open source contribution guide", specificity: "discovery", subtopic: "open-source" },
      { query: "system design interviews", specificity: "discovery", subtopic: "data-structures" },
    ],
    contentTypes: ["tutorials", "educational", "discussions"],
  },

  ai: {
    id: "ai",
    name: "AI",
    description: "Artificial intelligence, machine learning, and related fields",
    subtopics: [
      {
        id: "machine-learning",
        name: "Machine Learning",
        description: "ML algorithms and practical implementations",
        related: ["python", "neural-networks"],
      },
      {
        id: "llms",
        name: "Large Language Models",
        description: "LLMs, transformers, and generative AI",
        related: ["machine-learning"],
      },
      {
        id: "neural-networks",
        name: "Neural Networks",
        description: "Deep learning and neural network architectures",
        related: ["machine-learning"],
      },
      {
        id: "ai-tools",
        name: "AI Tools & Applications",
        description: "Practical AI tools and how to use them",
        related: ["llms"],
      },
    ],
    searches: [
      // Broad
      { query: "artificial intelligence", specificity: "broad" },
      { query: "machine learning basics", specificity: "broad" },
      // Specific
      { query: "machine learning tutorials", specificity: "specific", subtopic: "machine-learning" },
      { query: "LLM explained", specificity: "specific", subtopic: "llms" },
      { query: "neural networks basics", specificity: "specific", subtopic: "neural-networks" },
      { query: "how to use ChatGPT effectively", specificity: "specific", subtopic: "ai-tools" },
      // Discovery
      {
        query: "transformer architecture deep dive",
        specificity: "discovery",
        subtopic: "neural-networks",
      },
      { query: "fine-tuning language models", specificity: "discovery", subtopic: "llms" },
      { query: "building with AI APIs", specificity: "discovery", subtopic: "ai-tools" },
    ],
    contentTypes: ["educational", "tutorials", "discussions"],
  },

  cats: {
    id: "cats",
    name: "Cats",
    description: "Feline behavior, care, and entertainment",
    subtopics: [
      {
        id: "cat-behavior",
        name: "Cat Behavior",
        description: "Understanding feline behavior and psychology",
        related: ["cat-training"],
      },
      {
        id: "cat-care",
        name: "Cat Care",
        description: "Health, nutrition, and general cat care",
        related: [],
      },
      {
        id: "cat-training",
        name: "Cat Training",
        description: "Training and enrichment for cats",
        related: ["cat-behavior"],
      },
      {
        id: "funny-cats",
        name: "Funny & Entertainment",
        description: "Entertaining cat videos and content",
        related: [],
      },
      {
        id: "rescue-adoption",
        name: "Rescue & Adoption",
        description: "Kitten rescue, adoption, and welfare",
        related: ["cat-care"],
      },
    ],
    searches: [
      // Broad
      { query: "cats", specificity: "broad" },
      { query: "cat videos", specificity: "broad" },
      // Specific
      { query: "cat behavior explained", specificity: "specific", subtopic: "cat-behavior" },
      { query: "cat care tips", specificity: "specific", subtopic: "cat-care" },
      { query: "funny cats", specificity: "specific", subtopic: "funny-cats" },
      { query: "kitten rescue stories", specificity: "specific", subtopic: "rescue-adoption" },
      // Discovery
      { query: "feline body language guide", specificity: "discovery", subtopic: "cat-behavior" },
      { query: "indoor cat enrichment ideas", specificity: "discovery", subtopic: "cat-training" },
      { query: "cat nutrition and diet", specificity: "discovery", subtopic: "cat-care" },
    ],
    contentTypes: ["educational", "entertainment", "discussions"],
  },

  design: {
    id: "design",
    name: "Design",
    description: "Visual design, UX, and creative design disciplines",
    subtopics: [
      {
        id: "ui-design",
        name: "UI Design",
        description: "User interface and interaction design",
        related: ["ux-design"],
      },
      {
        id: "ux-design",
        name: "UX Design",
        description: "User experience and usability",
        related: ["ui-design"],
      },
      {
        id: "visual-design",
        name: "Visual Design",
        description: "Color, typography, and visual principles",
        related: ["ui-design"],
      },
      {
        id: "product-design",
        name: "Product Design",
        description: "End-to-end product design process",
        related: ["ux-design", "ui-design"],
      },
    ],
    searches: [
      // Broad
      { query: "design", specificity: "broad" },
      { query: "design tutorials", specificity: "broad" },
      // Specific
      { query: "UI design tutorials", specificity: "specific", subtopic: "ui-design" },
      { query: "UX design principles", specificity: "specific", subtopic: "ux-design" },
      { query: "typography basics", specificity: "specific", subtopic: "visual-design" },
      { query: "product design process", specificity: "specific", subtopic: "product-design" },
      // Discovery
      { query: "design system best practices", specificity: "discovery", subtopic: "ui-design" },
      { query: "user research methods", specificity: "discovery", subtopic: "ux-design" },
      { query: "accessibility in design", specificity: "discovery", subtopic: "ux-design" },
    ],
    contentTypes: ["tutorials", "educational", "discussions"],
  },

  science: {
    id: "science",
    name: "Science",
    description: "Scientific exploration and discovery",
    subtopics: [
      {
        id: "physics",
        name: "Physics",
        description: "Physics concepts and experiments",
        related: [],
      },
      {
        id: "biology",
        name: "Biology",
        description: "Biology and life sciences",
        related: [],
      },
      {
        id: "chemistry",
        name: "Chemistry",
        description: "Chemistry and chemical reactions",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "science", specificity: "broad" },
      { query: "science explainers", specificity: "broad" },
      // Specific
      { query: "physics basics", specificity: "specific", subtopic: "physics" },
      { query: "biology discoveries", specificity: "specific", subtopic: "biology" },
      { query: "chemistry experiments", specificity: "specific", subtopic: "chemistry" },
      // Discovery
      { query: "quantum mechanics explained", specificity: "discovery", subtopic: "physics" },
      { query: "genetic engineering breakthroughs", specificity: "discovery", subtopic: "biology" },
      { query: "nanotechnology applications", specificity: "discovery", subtopic: "chemistry" },
    ],
    contentTypes: ["educational", "discussions", "news"],
  },

  gaming: {
    id: "gaming",
    name: "Gaming",
    description: "Video games, game development, and gaming culture",
    subtopics: [
      {
        id: "game-development",
        name: "Game Development",
        description: "Creating games and game design",
        related: [],
      },
      {
        id: "indie-games",
        name: "Indie Games",
        description: "Independent game culture and reviews",
        related: ["game-development"],
      },
      {
        id: "gaming-reviews",
        name: "Game Reviews",
        description: "Game reviews and analysis",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "gaming", specificity: "broad" },
      { query: "game reviews", specificity: "broad" },
      // Specific
      { query: "game development tutorials", specificity: "specific", subtopic: "game-development" },
      { query: "indie games", specificity: "specific", subtopic: "indie-games" },
      { query: "game design analysis", specificity: "specific", subtopic: "game-development" },
      // Discovery
      {
        query: "game engine architecture",
        specificity: "discovery",
        subtopic: "game-development",
      },
      { query: "level design principles", specificity: "discovery", subtopic: "game-development" },
      { query: "emerging indie game studios", specificity: "discovery", subtopic: "indie-games" },
    ],
    contentTypes: ["entertainment", "tutorials", "discussions"],
  },

  business: {
    id: "business",
    name: "Business",
    description: "Business, entrepreneurship, and startups",
    subtopics: [
      {
        id: "entrepreneurship",
        name: "Entrepreneurship",
        description: "Starting and scaling businesses",
        related: ["startups"],
      },
      {
        id: "startups",
        name: "Startups",
        description: "Startup culture, lessons, and growth",
        related: ["entrepreneurship"],
      },
      {
        id: "business-strategy",
        name: "Business Strategy",
        description: "Strategy, marketing, and operations",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "business", specificity: "broad" },
      { query: "business strategy", specificity: "broad" },
      // Specific
      { query: "entrepreneurship lessons", specificity: "specific", subtopic: "entrepreneurship" },
      { query: "startup growth strategy", specificity: "specific", subtopic: "startups" },
      { query: "business case studies", specificity: "specific", subtopic: "business-strategy" },
      // Discovery
      { query: "founder interviews", specificity: "discovery", subtopic: "entrepreneurship" },
      { query: "product market fit analysis", specificity: "discovery", subtopic: "startups" },
      { query: "1x10 vs 10x1 growth", specificity: "discovery", subtopic: "business-strategy" },
    ],
    contentTypes: ["educational", "discussions", "news"],
  },

  music: {
    id: "music",
    name: "Music",
    description: "Music theory, production, and performance",
    subtopics: [
      {
        id: "music-theory",
        name: "Music Theory",
        description: "Music theory and composition",
        related: [],
      },
      {
        id: "music-production",
        name: "Music Production",
        description: "Recording, producing, and mixing music",
        related: [],
      },
      {
        id: "performance",
        name: "Performance",
        description: "Live performance and musicians",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "music", specificity: "broad" },
      { query: "music tutorials", specificity: "broad" },
      // Specific
      { query: "music theory basics", specificity: "specific", subtopic: "music-theory" },
      { query: "music production tutorials", specificity: "specific", subtopic: "music-production" },
      { query: "how to learn an instrument", specificity: "specific", subtopic: "performance" },
      // Discovery
      { query: "advanced harmony and reharmonization", specificity: "discovery", subtopic: "music-theory" },
      { query: "mixing and mastering techniques", specificity: "discovery", subtopic: "music-production" },
      { query: "performance psychology", specificity: "discovery", subtopic: "performance" },
    ],
    contentTypes: ["tutorials", "educational", "entertainment"],
  },

  fitness: {
    id: "fitness",
    name: "Fitness",
    description: "Exercise, health, and wellness",
    subtopics: [
      {
        id: "strength-training",
        name: "Strength Training",
        description: "Weightlifting and resistance training",
        related: [],
      },
      {
        id: "cardio",
        name: "Cardio & Conditioning",
        description: "Cardiovascular fitness and conditioning",
        related: [],
      },
      {
        id: "nutrition",
        name: "Nutrition",
        description: "Diet, nutrition, and supplementation",
        related: [],
      },
      {
        id: "wellness",
        name: "Wellness",
        description: "Mental health, mobility, and recovery",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "fitness", specificity: "broad" },
      { query: "workout routines", specificity: "broad" },
      // Specific
      { query: "strength training basics", specificity: "specific", subtopic: "strength-training" },
      { query: "home workout routines", specificity: "specific", subtopic: "cardio" },
      { query: "nutrition tips", specificity: "specific", subtopic: "nutrition" },
      { query: "stretching and mobility", specificity: "specific", subtopic: "wellness" },
      // Discovery
      {
        query: "periodization and progressive overload",
        specificity: "discovery",
        subtopic: "strength-training",
      },
      { query: "biomechanics of exercise", specificity: "discovery", subtopic: "strength-training" },
      { query: "metabolic adaptation", specificity: "discovery", subtopic: "nutrition" },
    ],
    contentTypes: ["tutorials", "educational", "discussions"],
  },

  photography: {
    id: "photography",
    name: "Photography",
    description: "Photography techniques and visual storytelling",
    subtopics: [
      {
        id: "technical",
        name: "Technical Skills",
        description: "Exposure, composition, and camera settings",
        related: [],
      },
      {
        id: "genres",
        name: "Photography Genres",
        description: "Portrait, landscape, street, and other genres",
        related: [],
      },
      {
        id: "editing",
        name: "Photo Editing",
        description: "Post-processing and photo editing",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "photography", specificity: "broad" },
      { query: "photography tutorials", specificity: "broad" },
      // Specific
      { query: "camera settings explained", specificity: "specific", subtopic: "technical" },
      { query: "portrait photography tips", specificity: "specific", subtopic: "genres" },
      { query: "landscape photography", specificity: "specific", subtopic: "genres" },
      { query: "photo editing basics", specificity: "specific", subtopic: "editing" },
      // Discovery
      {
        query: "advanced lighting techniques",
        specificity: "discovery",
        subtopic: "technical",
      },
      { query: "street photography aesthetics", specificity: "discovery", subtopic: "genres" },
      { query: "color grading workflow", specificity: "discovery", subtopic: "editing" },
    ],
    contentTypes: ["tutorials", "educational", "discussions"],
  },

  movies: {
    id: "movies",
    name: "Movies",
    description: "Film, cinematography, and storytelling",
    subtopics: [
      {
        id: "film-analysis",
        name: "Film Analysis",
        description: "Analyzing films and cinematography",
        related: [],
      },
      {
        id: "genres",
        name: "Film Genres",
        description: "Different film genres and styles",
        related: [],
      },
      {
        id: "filmmaking",
        name: "Filmmaking",
        description: "Making films and video production",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "movies", specificity: "broad" },
      { query: "film reviews", specificity: "broad" },
      // Specific
      { query: "cinematography breakdown", specificity: "specific", subtopic: "film-analysis" },
      { query: "film genres explained", specificity: "specific", subtopic: "genres" },
      { query: "movie recommendations", specificity: "specific", subtopic: "genres" },
      { query: "filmmaking basics", specificity: "specific", subtopic: "filmmaking" },
      // Discovery
      { query: "visual storytelling techniques", specificity: "discovery", subtopic: "film-analysis" },
      {
        query: "color in cinematography",
        specificity: "discovery",
        subtopic: "film-analysis",
      },
      { query: "narrative structure and plot", specificity: "discovery", subtopic: "filmmaking" },
    ],
    contentTypes: ["educational", "discussions", "entertainment"],
  },

  travel: {
    id: "travel",
    name: "Travel",
    description: "Exploration, culture, and adventure",
    subtopics: [
      {
        id: "travel-guides",
        name: "Travel Guides",
        description: "Destination guides and travel planning",
        related: [],
      },
      {
        id: "culture",
        name: "Culture & Local",
        description: "Local culture, food, and experiences",
        related: [],
      },
      {
        id: "adventure",
        name: "Adventure Travel",
        description: "Hiking, outdoor activities, and exploration",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "travel", specificity: "broad" },
      { query: "travel guides", specificity: "broad" },
      // Specific
      { query: "city travel guides", specificity: "specific", subtopic: "travel-guides" },
      { query: "local food travel", specificity: "specific", subtopic: "culture" },
      { query: "hiking adventures", specificity: "specific", subtopic: "adventure" },
      { query: "budget travel tips", specificity: "specific", subtopic: "travel-guides" },
      // Discovery
      { query: "hidden gems travel", specificity: "discovery", subtopic: "travel-guides" },
      { query: "cultural immersion travel", specificity: "discovery", subtopic: "culture" },
      { query: "off-the-beaten-path adventures", specificity: "discovery", subtopic: "adventure" },
    ],
    contentTypes: ["educational", "entertainment", "discussions"],
  },

  space: {
    id: "space",
    name: "Space",
    description: "Astronomy, space exploration, and cosmos",
    subtopics: [
      {
        id: "astronomy",
        name: "Astronomy",
        description: "Observing the stars and celestial objects",
        related: [],
      },
      {
        id: "space-exploration",
        name: "Space Exploration",
        description: "Space missions and astronautics",
        related: [],
      },
      {
        id: "cosmology",
        name: "Cosmology",
        description: "Universe structure and origins",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "space", specificity: "broad" },
      { query: "astronomy", specificity: "broad" },
      // Specific
      { query: "stargazing tips", specificity: "specific", subtopic: "astronomy" },
      { query: "space missions", specificity: "specific", subtopic: "space-exploration" },
      { query: "black holes explained", specificity: "specific", subtopic: "cosmology" },
      { query: "James Webb telescope images", specificity: "specific", subtopic: "astronomy" },
      // Discovery
      { query: "exoplanet discoveries", specificity: "discovery", subtopic: "cosmology" },
      { query: "SpaceX innovations", specificity: "discovery", subtopic: "space-exploration" },
      { query: "the future of space travel", specificity: "discovery", subtopic: "space-exploration" },
    ],
    contentTypes: ["educational", "news", "discussions"],
  },

  startups: {
    id: "startups",
    name: "Startups",
    description: "Startup culture, growth, and entrepreneurship",
    subtopics: [
      {
        id: "founder-journey",
        name: "Founder Journey",
        description: "Founder stories and experiences",
        related: [],
      },
      {
        id: "growth",
        name: "Growth & Scale",
        description: "Scaling startups and growth strategies",
        related: [],
      },
      {
        id: "fundraising",
        name: "Fundraising",
        description: "Venture capital and fundraising",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "startups", specificity: "broad" },
      { query: "startup lessons", specificity: "broad" },
      // Specific
      { query: "founder interviews", specificity: "specific", subtopic: "founder-journey" },
      { query: "startup growth strategy", specificity: "specific", subtopic: "growth" },
      { query: "fundraising basics", specificity: "specific", subtopic: "fundraising" },
      // Discovery
      { query: "Series A fundamentals", specificity: "discovery", subtopic: "fundraising" },
      { query: "product market fit deep dive", specificity: "discovery", subtopic: "growth" },
      { query: "founder mental health", specificity: "discovery", subtopic: "founder-journey" },
    ],
    contentTypes: ["educational", "discussions", "news"],
  },

  cybersecurity: {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Security, hacking, and privacy protection",
    subtopics: [
      {
        id: "web-security",
        name: "Web Security",
        description: "Web application security",
        related: [],
      },
      {
        id: "penetration-testing",
        name: "Penetration Testing",
        description: "Ethical hacking and penetration testing",
        related: [],
      },
      {
        id: "privacy",
        name: "Privacy Protection",
        description: "Privacy tools and data protection",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "cybersecurity", specificity: "broad" },
      { query: "security basics", specificity: "broad" },
      // Specific
      { query: "web security tutorials", specificity: "specific", subtopic: "web-security" },
      { query: "ethical hacking labs", specificity: "specific", subtopic: "penetration-testing" },
      { query: "privacy protection tips", specificity: "specific", subtopic: "privacy" },
      // Discovery
      { query: "OWASP Top 10 deep dive", specificity: "discovery", subtopic: "web-security" },
      { query: "advanced penetration testing", specificity: "discovery", subtopic: "penetration-testing" },
      {
        query: "zero-knowledge proofs",
        specificity: "discovery",
        subtopic: "privacy",
      },
    ],
    contentTypes: ["tutorials", "educational", "discussions"],
  },

  technology: {
    id: "technology",
    name: "Technology",
    description: "Technology trends, products, and innovation",
    subtopics: [
      {
        id: "tech-trends",
        name: "Tech Trends",
        description: "Emerging technology and trends",
        related: [],
      },
      {
        id: "consumer-tech",
        name: "Consumer Tech",
        description: "Consumer electronics and gadgets",
        related: [],
      },
      {
        id: "tech-industry",
        name: "Tech Industry",
        description: "Industry news and analysis",
        related: [],
      },
    ],
    searches: [
      // Broad
      { query: "technology", specificity: "broad" },
      { query: "tech news", specificity: "broad" },
      // Specific
      { query: "new technology explainers", specificity: "specific", subtopic: "tech-trends" },
      { query: "gadget reviews", specificity: "specific", subtopic: "consumer-tech" },
      { query: "tech industry analysis", specificity: "specific", subtopic: "tech-industry" },
      // Discovery
      { query: "emerging tech deep dive", specificity: "discovery", subtopic: "tech-trends" },
      { query: "quantum computing explained", specificity: "discovery", subtopic: "tech-trends" },
      { query: "regulation and big tech", specificity: "discovery", subtopic: "tech-industry" },
    ],
    contentTypes: ["news", "educational", "discussions"],
  },
};
