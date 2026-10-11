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
    aliases: ["software development", "coding", "software engineering"],
    description: "Software development, coding, and programming languages",
    relatedTopics: ["ai", "design", "technology"],
    creators: [
      {
        id: "freecodecamp",
        name: "freeCodeCamp",
        platform: "youtube",
        topics: ["programming", "ai", "technology"],
        description: "Practical programming lessons, projects, and foundational CS concepts.",
        url: "https://www.youtube.com/@freecodecamp",
        type: "education",
      },
      {
        id: "fireship",
        name: "Fireship",
        platform: "youtube",
        topics: ["programming", "ai", "technology"],
        description: "Fast-paced explainers on web development, tooling, and modern engineering.",
        url: "https://www.youtube.com/@Fireship",
        type: "explainers",
      },
      {
        id: "the-net-ninja",
        name: "The Net Ninja",
        platform: "youtube",
        topics: ["programming"],
        description: "Structured tutorials covering web development and front-end workflows.",
        url: "https://www.youtube.com/@NetNinja",
        type: "tutorials",
      },
    ],
    subtopics: [
      {
        id: "web-development",
        name: "Web Development",
        description: "Frontend, backend, and full-stack web technologies",
        related: ["javascript", "react", "python"],
        keywords: ["web", "fullstack", "frontend", "backend"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
      },
      {
        id: "python",
        name: "Python",
        description: "Python programming language and ecosystem",
        related: ["data-science", "web-development"],
        keywords: ["python", "scripts", "backend", "async"],
        recommendedFormats: ["tutorials", "educational"],
      },
      {
        id: "javascript",
        name: "JavaScript",
        description: "JavaScript and TypeScript for web and beyond",
        related: ["web-development", "react"],
        keywords: ["javascript", "typescript", "node", "runtime"],
        recommendedFormats: ["tutorials", "discussions"],
      },
      {
        id: "react",
        name: "React",
        description: "React library for building user interfaces",
        related: ["javascript", "web-development"],
        keywords: ["react", "components", "hooks", "state"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
      },
      {
        id: "data-structures",
        name: "Data Structures & Visual Explanations",
        description: "Understanding data structures through visual explanations and benchmarks",
        related: ["python", "interviews"],
        keywords: ["algorithms", "trees", "graphs", "complexity"],
        recommendedFormats: ["educational", "tutorials"],
      },
      {
        id: "debugging",
        name: "Application Debugging",
        description: "Debugging real-world applications, memory leaks, and profiling",
        related: ["memory-management", "software-architecture"],
        keywords: ["debugging", "stacktrace", "profiler", "memory leak"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
      },
      {
        id: "memory-management",
        name: "Memory Management",
        description: "Understanding memory management, stack vs heap, and allocation",
        related: ["debugging"],
        keywords: ["memory", "heap", "stack", "gc", "pointers"],
        recommendedFormats: ["educational", "deep-dive"],
      },
      {
        id: "software-architecture",
        name: "Software Architecture",
        description: "Comparing software architecture approaches, modularity, and clean design",
        related: ["code-review"],
        keywords: ["architecture", "clean code", "patterns", "monolith", "microservices"],
        recommendedFormats: ["educational", "discussions"],
      },
      {
        id: "code-review",
        name: "Code Review & Unfamiliar Code",
        description: "Reading and reviewing unfamiliar codebases and architectural evaluation",
        related: ["software-architecture"],
        keywords: ["code review", "reading code", "refactoring", "pull requests"],
        recommendedFormats: ["discussions", "tutorials"],
      },
      {
        id: "project-builds",
        name: "Small Projects From Scratch",
        description: "Building small projects from scratch to understand design decisions",
        related: ["web-development", "python"],
        keywords: ["project build", "from scratch", "hands on", "cli tool"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
      },
      {
        id: "open-source",
        name: "Open Source",
        description: "Contributing to and maintaining open source projects",
        related: [],
        keywords: ["git", "github", "prs", "contributing"],
        recommendedFormats: ["tutorials", "discussions"],
      },
    ],
    searches: [
      // Broad (Days 1-2)
      { query: "programming", specificity: "broad", contentTypes: ["tutorials", "discussions", "news"] },
      { query: "software development", specificity: "broad", contentTypes: ["tutorials", "discussions"] },
      { query: "coding tutorials", specificity: "broad", contentTypes: ["tutorials", "educational"] },
      // Specific (Days 3-4)
      { query: "Python programming", specificity: "specific", subtopic: "python", contentTypes: ["tutorials", "educational", "project-walkthroughs"] },
      { query: "debugging a real-world application step-by-step", specificity: "specific", subtopic: "debugging", contentTypes: ["tutorials", "project-walkthroughs"] },
      { query: "understanding memory management stack heap explained", specificity: "specific", subtopic: "memory-management", contentTypes: ["educational", "tutorials"] },
      { query: "comparing software architecture approaches clean vs pragmatic", specificity: "specific", subtopic: "software-architecture", contentTypes: ["educational", "discussions"] },
      { query: "reading and reviewing unfamiliar code walkthrough", specificity: "specific", subtopic: "code-review", contentTypes: ["tutorials", "discussions"] },
      { query: "building a small project from scratch tutorial", specificity: "specific", subtopic: "project-builds", contentTypes: ["tutorials", "project-walkthroughs"] },
      { query: "data structures visual explanation step-by-step", specificity: "specific", subtopic: "data-structures", contentTypes: ["educational", "tutorials"] },
      { query: "JavaScript tutorials", specificity: "specific", subtopic: "javascript", contentTypes: ["tutorials", "project-walkthroughs"] },
      { query: "React tutorials", specificity: "specific", subtopic: "react", contentTypes: ["tutorials", "project-walkthroughs"] },
      // Discovery (Days 5-6)
      { query: "Python async programming patterns", specificity: "discovery", subtopic: "python", contentTypes: ["tutorials", "discussions"] },
      { query: "Python application architecture code review deep dive", specificity: "discovery", subtopic: "software-architecture", contentTypes: ["tutorials", "discussions"] },
      { query: "React performance optimization", specificity: "discovery", subtopic: "react", contentTypes: ["tutorials", "discussions"] },
      { query: "system design distributed services failure recovery", specificity: "discovery", subtopic: "software-architecture", contentTypes: ["tutorials", "discussions"] },
      { query: "memory profiler leak diagnosis production engineering", specificity: "discovery", subtopic: "memory-management", contentTypes: ["tutorials", "discussions"] },
      { query: "open source contribution guide", specificity: "discovery", subtopic: "open-source", contentTypes: ["tutorials", "discussions"] },
    ],
    creatorGuidance: [
      {
        id: "prog-senior-engineers",
        topicId: "programming",
        subtopicId: "software-architecture",
        instruction: "Search for senior software engineers who walk through code reviews and real-world system architectures.",
        whatToLookFor: [
          "Explains engineering trade-offs rather than dogmatic rules",
          "Walks through real production repositories and codebases",
          "Provides clear visual diagrams of architectural components",
        ],
        searchQuery: "software engineer code review real world architecture walkthrough",
      },
      {
        id: "prog-debugging-practitioners",
        topicId: "programming",
        subtopicId: "debugging",
        instruction: "Look for developers who record live application debugging sessions and root cause analyses.",
        whatToLookFor: [
          "Demonstrates interactive debugging, stack inspection, and log analysis",
          "Explains thought process when encountering unexpected error states",
          "Shows real-world terminal and IDE tooling without skipping steps",
        ],
        searchQuery: "live coding debugging root cause analysis real application",
      },
    ],
    contentTypes: ["tutorials", "educational", "project-walkthroughs", "discussions", "news"],
  },

  ai: {
    id: "ai",
    name: "AI",
    aliases: ["artificial intelligence", "machine learning", "ml"],
    description: "Artificial intelligence, machine learning, and related fields",
    relatedTopics: ["programming", "technology", "science"],
    creators: [
      {
        id: "two-minute-papers",
        name: "Two Minute Papers",
        platform: "youtube",
        topics: ["ai", "science"],
        description: "Accessible AI research explainers and visible breakthroughs in machine learning.",
        url: "https://www.youtube.com/@TwoMinutePapers",
        type: "research",
      },
      {
        id: "fireship",
        name: "Fireship",
        platform: "youtube",
        topics: ["programming", "ai", "technology"],
        description: "Short-form AI explainers and implementation stories without the fluff.",
        url: "https://www.youtube.com/@Fireship",
        type: "explainers",
      },
      {
        id: "freecodecamp",
        name: "freeCodeCamp",
        platform: "youtube",
        topics: ["programming", "ai", "technology"],
        description: "Hands-on AI and practical programming tutorials for builders.",
        url: "https://www.youtube.com/@freecodecamp",
        type: "education",
      },
    ],
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
      { query: "artificial intelligence", specificity: "broad", contentTypes: ["educational", "news"] },
      { query: "machine learning basics", specificity: "broad", contentTypes: ["educational", "tutorials"] },
      // Specific
      { query: "machine learning tutorials", specificity: "specific", subtopic: "machine-learning", contentTypes: ["tutorials", "educational"] },
      { query: "LLM explained", specificity: "specific", subtopic: "llms", contentTypes: ["educational", "tutorials"] },
      { query: "neural networks basics", specificity: "specific", subtopic: "neural-networks", contentTypes: ["educational", "tutorials"] },
      { query: "how to use ChatGPT effectively", specificity: "specific", subtopic: "ai-tools", contentTypes: ["tutorials", "discussions"] },
      // Discovery
      {
        query: "transformer architecture deep dive",
        specificity: "discovery",
        subtopic: "neural-networks",
        contentTypes: ["tutorials", "educational"],
      },
      { query: "fine-tuning language models", specificity: "discovery", subtopic: "llms", contentTypes: ["tutorials", "discussions"] },
      { query: "building with AI APIs", specificity: "discovery", subtopic: "ai-tools", contentTypes: ["tutorials", "project-walkthroughs"] },
    ],
    contentTypes: ["educational", "tutorials", "project-walkthroughs", "discussions", "news"],
  },

  cats: {
    id: "cats",
    name: "Cats",
    aliases: ["felines", "cat care", "cat behavior"],
    description: "Feline behavior, care, and entertainment",
    relatedTopics: ["design", "photography"],
    creators: [
      {
        id: "jackson-galaxy",
        name: "Jackson Galaxy",
        platform: "youtube",
        topics: ["cats"],
        description: "Cat behavior education and practical cat-care guidance.",
        url: "https://www.youtube.com/@JacksonGalaxy",
        type: "education",
      },
      {
        id: "kitten-lady",
        name: "Kitten Lady",
        platform: "youtube",
        topics: ["cats"],
        description: "Kitten rescue, care, and welfare education with a practical perspective.",
        url: "https://www.youtube.com/@KittenLady",
        type: "care",
      },
    ],
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
      { query: "cats", specificity: "broad", contentTypes: ["entertainment", "educational"] },
      { query: "cat videos", specificity: "broad", contentTypes: ["entertainment", "funny-clips"] },
      // Specific
      { query: "cat behavior explained", specificity: "specific", subtopic: "cat-behavior", contentTypes: ["educational", "tutorials"] },
      { query: "cat care tips", specificity: "specific", subtopic: "cat-care", contentTypes: ["educational", "tutorials"] },
      { query: "funny cats", specificity: "specific", subtopic: "funny-cats", contentTypes: ["entertainment", "funny-clips"] },
      { query: "kitten rescue stories", specificity: "specific", subtopic: "rescue-adoption", contentTypes: ["educational", "discussions"] },
      // Discovery
      { query: "feline body language guide", specificity: "discovery", subtopic: "cat-behavior", contentTypes: ["educational", "discussions"] },
      { query: "indoor cat enrichment ideas", specificity: "discovery", subtopic: "cat-training", contentTypes: ["tutorials", "educational"] },
      { query: "cat nutrition and diet", specificity: "discovery", subtopic: "cat-care", contentTypes: ["educational", "tutorials"] },
    ],
    contentTypes: ["educational", "entertainment", "funny-clips", "tutorials", "discussions"],
  },

  design: {
    id: "design",
    name: "Design",
    aliases: ["visual design", "ux design", "ui design"],
    description: "Visual design, UX, and creative design disciplines",
    relatedTopics: ["programming", "technology"],
    creators: [
      {
        id: "adobe-max",
        name: "Adobe MAX",
        platform: "youtube",
        topics: ["design"],
        description: "Design inspiration, product thinking, and creative workflows.",
        url: "https://www.youtube.com/@AdobeCreativeCloud",
        type: "inspiration",
      },
    ],
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
      { query: "design", specificity: "broad", contentTypes: ["tutorials", "discussions"] },
      { query: "design tutorials", specificity: "broad", contentTypes: ["tutorials", "educational"] },
      // Specific
      { query: "UI design tutorials", specificity: "specific", subtopic: "ui-design", contentTypes: ["tutorials", "educational"] },
      { query: "UX design principles", specificity: "specific", subtopic: "ux-design", contentTypes: ["educational", "discussions"] },
      { query: "typography basics", specificity: "specific", subtopic: "visual-design", contentTypes: ["tutorials", "educational"] },
      { query: "product design process", specificity: "specific", subtopic: "product-design", contentTypes: ["tutorials", "discussions"] },
      // Discovery
      { query: "design system best practices", specificity: "discovery", subtopic: "ui-design", contentTypes: ["tutorials", "discussions"] },
      { query: "user research methods", specificity: "discovery", subtopic: "ux-design", contentTypes: ["educational", "discussions"] },
      { query: "accessibility in design", specificity: "discovery", subtopic: "ux-design", contentTypes: ["tutorials", "educational"] },
    ],
    contentTypes: ["tutorials", "educational", "discussions", "news"],
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
    creators: [
      {
        id: "gdc",
        name: "GDC",
        platform: "youtube",
        topics: ["gaming"],
        description: "Game design, production, and dev insights from the people building games.",
        url: "https://www.youtube.com/@GDC",
        type: "industry",
      },
      {
        id: "jordan-rivory",
        name: "Jordan Rivory",
        platform: "youtube",
        topics: ["gaming"],
        description: "FPS tactics, game analysis, and practical competitive guidance.",
        url: "https://www.youtube.com/@JordanRivory",
        type: "analysis",
      },
    ],
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
      { query: "enterprise business scale strategy", specificity: "specific", subtopic: "business-strategy" },
      { query: "business case studies", specificity: "specific", subtopic: "business-strategy" },
      // Discovery
      { query: "executive founder retrospectives", specificity: "discovery", subtopic: "entrepreneurship" },
      { query: "product market fit analysis", specificity: "discovery", subtopic: "startups" },
      { query: "1x10 vs 10x1 growth", specificity: "discovery", subtopic: "business-strategy" },
    ],
    creatorGuidance: [
      {
        id: "biz-operators",
        topicId: "business",
        subtopicId: "business-strategy",
        instruction: "Search for operators and CFOs who break down unit economics and capital allocation.",
        whatToLookFor: [
          "Balance sheet and P&L walk-throughs",
          "Focus on cash flow and distribution rather than vanity metrics",
          "Objective analysis of business model strengths and weaknesses",
        ],
        searchQuery: "business operator unit economics capital allocation breakdown",
      },
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
    creators: [
      {
        id: "nate-berkus",
        name: "Nate Berkus",
        platform: "youtube",
        topics: ["fitness"],
        description: "Strength and conditioning guidance built around practical progress and consistency.",
        url: "https://www.youtube.com/@NateBerkus",
        type: "fitness",
      },
      {
        id: "bodyfit-by-brian",
        name: "BodyFit by Brian",
        platform: "youtube",
        topics: ["fitness"],
        description: "Workout plans and strength-training education aimed at sustainable progress.",
        url: "https://www.youtube.com/@bodyfitbybrian",
        type: "fitness",
      },
    ],
    subtopics: [
      {
        id: "strength-training",
        name: "Strength Training",
        description: "Weightlifting and resistance training",
        related: ["strength-technique", "recovery-mobility"],
        keywords: ["weights", "lifting", "hypertrophy", "progressive overload"],
        recommendedFormats: ["tutorials", "educational"],
      },
      {
        id: "cardio",
        name: "Cardio & Conditioning",
        description: "Cardiovascular fitness and conditioning",
        related: ["running-form"],
        keywords: ["cardio", "endurance", "aerobic", "conditioning"],
        recommendedFormats: ["tutorials", "demonstrations"],
      },
      {
        id: "nutrition",
        name: "Nutrition",
        description: "Diet, nutrition, and supplementation",
        related: ["recovery-mobility"],
        keywords: ["protein", "macronutrients", "hydration", "diet"],
        recommendedFormats: ["educational", "meal-prep"],
      },
      {
        id: "wellness",
        name: "Wellness",
        description: "Mental health, mobility, and recovery",
        related: ["recovery-mobility"],
        keywords: ["sleep", "stress", "sauna", "stretching"],
        recommendedFormats: ["educational", "routines"],
      },
      {
        id: "running-form",
        name: "Running Form Analysis",
        description: "Running form analysis, cadence, foot strike, and breathing rhythm",
        related: ["cardio"],
        keywords: ["cadence", "gait", "footstrike", "running mechanics"],
        recommendedFormats: ["demonstrations", "tutorials"],
      },
      {
        id: "strength-technique",
        name: "Strength Technique Demonstrations",
        description: "Strength-training technique demonstrations, barbell cues, and form correction",
        related: ["strength-training"],
        keywords: ["squat cues", "deadlift form", "bench press arch", "biomechanics"],
        recommendedFormats: ["demonstrations", "tutorials"],
      },
      {
        id: "recovery-mobility",
        name: "Recovery & Mobility",
        description: "Recovery and mobility education, active stretches, and joint health",
        related: ["wellness"],
        keywords: ["mobility", "foam roller", "hip flexors", "active recovery"],
        recommendedFormats: ["routines", "educational"],
      },
      {
        id: "exercise-execution",
        name: "Exercise Execution Breakdowns",
        description: "Exercise execution breakdowns, joint alignment, and common form mistakes",
        related: ["strength-technique"],
        keywords: ["exercise form", "joint alignment", "muscle activation", "cues"],
        recommendedFormats: ["demonstrations", "educational"],
      },
    ],
    searches: [
      // Broad
      { query: "fitness", specificity: "broad" },
      { query: "workout routines", specificity: "broad" },
      { query: "exercise fundamentals", specificity: "broad" },
      // Specific
      { query: "strength training basics", specificity: "specific", subtopic: "strength-training" },
      { query: "aerobic running mechanics cadence breakdown", specificity: "specific", subtopic: "running-form" },
      { query: "strength training technique demonstrations squat hinge cues", specificity: "specific", subtopic: "strength-technique" },
      { query: "recovery and mobility education active stretching routine", specificity: "specific", subtopic: "recovery-mobility" },
      { query: "exercise execution breakdowns common form mistakes correction", specificity: "specific", subtopic: "exercise-execution" },
      { query: "home workout routines", specificity: "specific", subtopic: "cardio" },
      { query: "nutrition tips", specificity: "specific", subtopic: "nutrition" },
      { query: "stretching and mobility", specificity: "specific", subtopic: "wellness" },
      // Discovery
      { query: "running biomechanics VO2 max aerobic threshold pacing science", specificity: "discovery", subtopic: "running-form" },
      { query: "periodization and progressive overload", specificity: "discovery", subtopic: "strength-training" },
      { query: "electromyography muscle activation exercise execution deep dive", specificity: "discovery", subtopic: "exercise-execution" },
      { query: "biomechanics of exercise", specificity: "discovery", subtopic: "strength-technique" },
      { query: "post exercise autonomic recovery HRV sleep architecture", specificity: "discovery", subtopic: "recovery-mobility" },
      { query: "metabolic adaptation", specificity: "discovery", subtopic: "nutrition" },
    ],
    creatorGuidance: [
      {
        id: "fit-coaches",
        topicId: "fitness",
        subtopicId: "running-form",
        instruction: "Look for running coaches and exercise physiologists who demonstrate and explain movement technique.",
        whatToLookFor: [
          "Slow-motion movement and gait breakdowns",
          "Anatomical explanations of common faults rather than generic motivation",
          "Actionable drills that can be practiced independently",
        ],
        searchQuery: "running coach form analysis biomechanics technique demonstration",
      },
      {
        id: "fit-strength-cues",
        topicId: "fitness",
        subtopicId: "strength-technique",
        instruction: "Find strength and conditioning coaches who break down compound lift execution with joint angle cues.",
        whatToLookFor: [
          "Bar path tracking and spinal alignment cues",
          "Clear regressions and progressions for common mobility restrictions",
          "Evidence-based load management advice",
        ],
        searchQuery: "strength coach compound lift execution form cues biomechanics",
      },
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
        related: ["composition"],
        keywords: ["shutter speed", "aperture", "iso", "metering"],
      },
      {
        id: "photo-genres",
        name: "Photography Genres",
        description: "Portrait, landscape, street, and other genres",
        related: ["low-light", "portrait-lighting"],
        keywords: ["landscape", "street", "documentary", "astrophotography"],
      },
      {
        id: "editing",
        name: "Photo Editing",
        description: "Post-processing and photo editing",
        related: ["photo-editing"],
        keywords: ["lightroom", "photoshop", "capture one", "raw"],
      },
      {
        id: "low-light",
        name: "Low-Light Photography",
        description: "Low-light photography techniques, noise management, and long exposures",
        related: ["technical"],
        keywords: ["night", "long exposure", "noise reduction", "tripod"],
      },
      {
        id: "composition",
        name: "Composition Breakdowns",
        description: "Composition breakdowns, leading lines, framing, and visual balance",
        related: ["technical"],
        keywords: ["rule of thirds", "leading lines", "framing", "negative space"],
      },
      {
        id: "portrait-lighting",
        name: "Portrait Lighting",
        description: "Portrait lighting demonstrations, softboxes, and key/fill ratios",
        related: ["photo-genres"],
        keywords: ["softbox", "key light", "fill light", "rembrandt lighting"],
      },
      {
        id: "lens-comparisons",
        name: "Lens Comparisons",
        description: "Focal length comparisons, aperture rendering, and optical qualities",
        related: ["technical"],
        keywords: ["35mm", "50mm", "85mm", "bokeh", "distortion"],
      },
      {
        id: "photo-editing",
        name: "Photo Editing Workflows",
        description: "Raw developing, color grading, and selective masking workflows",
        related: ["editing"],
        keywords: ["color grading", "curves", "tone curve", "masking"],
      },
    ],
    searches: [
      // Broad
      { query: "photography", specificity: "broad" },
      { query: "photography tutorials", specificity: "broad" },
      { query: "photography composition basics", specificity: "broad" },
      // Specific
      { query: "camera settings explained", specificity: "specific", subtopic: "technical" },
      { query: "low light photography techniques noise management", specificity: "specific", subtopic: "low-light" },
      { query: "composition breakdowns leading lines framing analysis", specificity: "specific", subtopic: "composition" },
      { query: "portrait lighting demonstrations softbox key fill setup", specificity: "specific", subtopic: "portrait-lighting" },
      { query: "lens comparisons 35mm vs 50mm vs 85mm portrait", specificity: "specific", subtopic: "lens-comparisons" },
      { query: "photo editing workflows raw color grading curve tutorial", specificity: "specific", subtopic: "photo-editing" },
      { query: "portrait photography tips", specificity: "specific", subtopic: "photo-genres" },
      { query: "landscape photography", specificity: "specific", subtopic: "photo-genres" },
      { query: "photo editing basics", specificity: "specific", subtopic: "editing" },
      // Discovery
      { query: "high dynamic range exposure blending landscape deep dive", specificity: "discovery", subtopic: "photo-editing" },
      { query: "optical lens aberration distortion MTF chart analysis", specificity: "discovery", subtopic: "lens-comparisons" },
      { query: "editorial portrait lighting setup behind the scenes breakdown", specificity: "discovery", subtopic: "portrait-lighting" },
      { query: "advanced lighting techniques", specificity: "discovery", subtopic: "technical" },
      { query: "street photography aesthetics", specificity: "discovery", subtopic: "photo-genres" },
      { query: "color grading workflow", specificity: "discovery", subtopic: "editing" },
    ],
    creatorGuidance: [
      {
        id: "photo-breakdowns",
        topicId: "photography",
        subtopicId: "portrait-lighting",
        instruction: "Explore photographers who publish complete lighting and editing breakdowns.",
        whatToLookFor: [
          "Diagrams showing exact light placement and camera parameters",
          "Side-by-side unedited RAW and final image comparisons",
          "Clear explanation of why specific modifier sizes and positions were chosen",
        ],
        searchQuery: "photographer portrait lighting diagram raw editing breakdown",
      },
      {
        id: "photo-composition-masters",
        topicId: "photography",
        subtopicId: "composition",
        instruction: "Look for street and landscape photographers who break down compositional geometry on location.",
        whatToLookFor: [
          "Field breakdown of scene selection and waiting for the right moment",
          "Analysis of contact sheets and discarded shots",
          "Focus on visual narrative rather than gear marketing",
        ],
        searchQuery: "street photography composition field breakdown contact sheet",
      },
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
        id: "film-genres",
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
      { query: "film genres explained", specificity: "specific", subtopic: "film-genres" },
      { query: "movie recommendations", specificity: "specific", subtopic: "film-genres" },
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
      { query: "early stage startup founder interviews", specificity: "specific", subtopic: "founder-journey" },
      { query: "seed stage startup growth strategy", specificity: "specific", subtopic: "growth" },
      { query: "fundraising basics", specificity: "specific", subtopic: "fundraising" },
      // Discovery
      { query: "Series A fundamentals", specificity: "discovery", subtopic: "fundraising" },
      { query: "product market fit deep dive", specificity: "discovery", subtopic: "growth" },
      { query: "founder mental health", specificity: "discovery", subtopic: "founder-journey" },
    ],
    creatorGuidance: [
      {
        id: "startup-founders",
        topicId: "startups",
        subtopicId: "founder-journey",
        instruction: "Look for bootstrapped and venture founders who publish transparent retrospective postmortems.",
        whatToLookFor: [
          "Honest discussions of early distribution bottlenecks",
          "Real numbers on churn and customer acquisition costs",
          "Zero motivational platitudes or hustle culture posturing",
        ],
        searchQuery: "bootstrapped founder transparent postmortem churn distribution",
      },
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
    creatorGuidance: [
      {
        id: "tech-analysts",
        topicId: "technology",
        subtopicId: "tech-industry",
        instruction: "Search for technology analysts and hardware engineers who inspect silicon and supply chains.",
        whatToLookFor: [
          "Teardowns of actual hardware and chip dies",
          "Objective analysis of manufacturing constraints",
          "Zero paid brand ambassador promotional videos",
        ],
        searchQuery: "technology analyst hardware teardown supply chain silicon",
      },
    ],
    contentTypes: ["news", "educational", "discussions"],
  },

  linux: {
    id: "linux",
    name: "Linux",
    aliases: ["linux os", "gnu linux", "unix", "sysadmin", "kernel"],
    description: "Linux operating systems, kernel internals, sysadmin workflows, and shell environments",
    relatedTopics: ["programming", "cybersecurity", "technology"],
    subtopics: [
      {
        id: "linux-internals",
        name: "Linux Internals",
        description: "Kernel architecture, process lifecycle, memory management, and system calls",
        related: ["system-troubleshooting", "server-administration"],
        keywords: ["kernel", "sysfs", "systemd", "cgroups", "syscalls"],
        recommendedFormats: ["educational", "tutorials"],
        whatToLookFor: "Demonstrates kernel tracing, memory layout, or process lifecycle with real commands",
      },
      {
        id: "shell-scripting",
        name: "Shell Scripting & Terminal",
        description: "Bash, POSIX scripting, command-line tooling, and automation workflows",
        related: ["server-administration"],
        keywords: ["bash", "terminal", "posix", "cli", "pipes"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
        whatToLookFor: "Shows robust error handling, pipeline composition, and POSIX compliance",
      },
      {
        id: "system-troubleshooting",
        name: "System Troubleshooting",
        description: "Diagnostics, logs, strace, perf, and performance tuning",
        related: ["linux-internals"],
        keywords: ["strace", "perf", "dmesg", "journalctl", "htop"],
        recommendedFormats: ["tutorials", "walkthroughs"],
        whatToLookFor: "Live debugging of broken systems using standard diagnostic utilities",
      },
      {
        id: "server-administration",
        name: "Server Administration",
        description: "Containerization, networking, server hardening, and systemd units",
        related: ["shell-scripting", "system-troubleshooting"],
        keywords: ["nginx", "ssh", "docker", "iptables", "systemd"],
        recommendedFormats: ["tutorials", "discussions"],
        whatToLookFor: "Practical production configuration and security hardening without shortcuts",
      },
    ],
    searches: [
      // Broad
      { query: "Linux operating system fundamentals", specificity: "broad", contentTypes: ["educational", "tutorials"] },
      { query: "Linux command line tutorials", specificity: "broad", contentTypes: ["tutorials"] },
      { query: "Linux server administration basics", specificity: "broad", contentTypes: ["tutorials"] },
      // Specific
      { query: "Linux internals memory management explained", specificity: "specific", subtopic: "linux-internals", contentTypes: ["educational", "tutorials"] },
      { query: "Bash shell scripting automation practical", specificity: "specific", subtopic: "shell-scripting", contentTypes: ["tutorials"] },
      { query: "Linux system troubleshooting strace journalctl", specificity: "specific", subtopic: "system-troubleshooting", contentTypes: ["tutorials"] },
      { query: "Linux server container hardening guide", specificity: "specific", subtopic: "server-administration", contentTypes: ["tutorials"] },
      // Discovery
      { query: "Linux kernel architecture deep dive", specificity: "discovery", subtopic: "linux-internals", contentTypes: ["educational", "discussions"] },
      { query: "Linux performance optimization eBPF", specificity: "discovery", subtopic: "system-troubleshooting", contentTypes: ["educational", "tutorials"] },
      { query: "Linux system programming POSIX C", specificity: "discovery", subtopic: "linux-internals", contentTypes: ["tutorials"] },
    ],
    creatorGuidance: [
      {
        id: "linux-practitioners",
        topicId: "linux",
        subtopicId: "linux-internals",
        instruction: "Search for creators who explain Linux internals with practical demonstrations.",
        whatToLookFor: [
          "Live terminal debugging and kernel source walkthroughs",
          "Focus on POSIX standards and system architecture",
          "Zero superficial distro-hopping review content",
        ],
        searchQuery: "Linux internals practical terminal demonstrations kernel architecture",
      },
      {
        id: "linux-sysadmins",
        topicId: "linux",
        subtopicId: "system-troubleshooting",
        instruction: "Find system administrators who demonstrate live server troubleshooting and shell scripting.",
        whatToLookFor: [
          "Real incident postmortems with log analysis",
          "Clean pipeline scripting and diagnostic tooling",
          "Transparent explanation of root causes",
        ],
        searchQuery: "Linux server troubleshooting live strace perf practical",
      },
    ],
    contentTypes: ["tutorials", "educational", "discussions"],
  },

  "strength-training": {
    id: "strength-training",
    name: "Strength Training",
    aliases: ["weightlifting", "powerlifting", "resistance training", "hypertrophy"],
    description: "Resistance training, barbell mechanics, hypertrophy science, and progressive overload",
    relatedTopics: ["fitness", "nutrition", "running"],
    subtopics: [
      {
        id: "barbell-mechanics",
        name: "Barbell Mechanics",
        description: "Squat, bench press, deadlift, and overhead press technique breakdowns",
        related: ["hypertrophy-science", "mobility-recovery"],
        keywords: ["squat", "deadlift", "bench press", "bar path", "cues"],
        recommendedFormats: ["demonstrations", "tutorials"],
      },
      {
        id: "hypertrophy-science",
        name: "Hypertrophy Science",
        description: "Volume, frequency, mechanical tension, and progressive overload programming",
        related: ["barbell-mechanics"],
        keywords: ["volume", "intensity", "reps in reserve", "progressive overload"],
        recommendedFormats: ["educational", "discussions"],
      },
      {
        id: "mobility-recovery",
        name: "Mobility & Joint Health",
        description: "Joint preparation, warm-ups, active mobility, and lifting longevity",
        related: ["barbell-mechanics"],
        keywords: ["mobility", "shoulder health", "hip mobility", "warmup"],
        recommendedFormats: ["routines", "tutorials"],
      },
    ],
    searches: [
      // Broad
      { query: "strength training fundamentals", specificity: "broad", contentTypes: ["educational", "tutorials"] },
      { query: "resistance training basics", specificity: "broad", contentTypes: ["tutorials"] },
      { query: "beginner barbell training", specificity: "broad", contentTypes: ["tutorials"] },
      // Specific
      { query: "squat and deadlift form breakdown biomechanics", specificity: "specific", subtopic: "barbell-mechanics", contentTypes: ["demonstrations", "tutorials"] },
      { query: "progressive overload hypertrophy programming", specificity: "specific", subtopic: "hypertrophy-science", contentTypes: ["educational"] },
      { query: "strength training recovery mobility routine", specificity: "specific", subtopic: "mobility-recovery", contentTypes: ["routines"] },
      { query: "barbell bench press bar path cues", specificity: "specific", subtopic: "barbell-mechanics", contentTypes: ["demonstrations"] },
      // Discovery
      { query: "advanced powerlifting periodization science", specificity: "discovery", subtopic: "hypertrophy-science", contentTypes: ["educational", "discussions"] },
      { query: "muscle hypertrophy mechanics research breakdown", specificity: "discovery", subtopic: "hypertrophy-science", contentTypes: ["educational"] },
      { query: "injury prevention joint mechanics lifting", specificity: "discovery", subtopic: "mobility-recovery", contentTypes: ["educational"] },
    ],
    creatorGuidance: [
      {
        id: "strength-biomechanists",
        topicId: "strength-training",
        subtopicId: "barbell-mechanics",
        instruction: "Look for strength coaches who demonstrate barbell mechanics with clear anatomical breakdowns.",
        whatToLookFor: [
          "Form cues based on individual limb proportions",
          "Evidence-based programming advice",
          "Zero miracle supplement promotion or extreme claims",
        ],
        searchQuery: "strength coach barbell technique breakdown anatomy cues",
      },
    ],
    contentTypes: ["tutorials", "educational", "demonstrations"],
  },

  nutrition: {
    id: "nutrition",
    name: "Nutrition",
    aliases: ["dietetics", "sports nutrition", "macronutrients", "healthy eating"],
    description: "Evidence-based nutrition, macronutrient partitioning, metabolic health, and meal planning",
    relatedTopics: ["fitness", "strength-training", "science"],
    subtopics: [
      {
        id: "macronutrient-science",
        name: "Macronutrient Science",
        description: "Protein synthesis, carbohydrate timing, fatty acids, and energy balance",
        related: ["metabolic-health"],
        keywords: ["protein", "carbohydrates", "leucine", "energy balance"],
        recommendedFormats: ["educational"],
      },
      {
        id: "meal-prep-systems",
        name: "Meal Preparation Systems",
        description: "Practical batch cooking, balanced grocery planning, and sustainable prep",
        related: ["macronutrient-science"],
        keywords: ["meal prep", "batch cooking", "groceries", "recipes"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
      },
      {
        id: "metabolic-health",
        name: "Metabolic Health",
        description: "Insulin sensitivity, micronutrient density, and hydration protocols",
        related: ["macronutrient-science"],
        keywords: ["micronutrients", "electrolytes", "metabolic rate", "hydration"],
        recommendedFormats: ["educational", "discussions"],
      },
    ],
    searches: [
      // Broad
      { query: "nutrition science fundamentals", specificity: "broad", contentTypes: ["educational"] },
      { query: "healthy meal prep basics", specificity: "broad", contentTypes: ["tutorials"] },
      { query: "macronutrients explained", specificity: "broad", contentTypes: ["educational"] },
      // Specific
      { query: "protein intake timing muscle protein synthesis", specificity: "specific", subtopic: "macronutrient-science", contentTypes: ["educational"] },
      { query: "high protein meal prep practical batch cooking", specificity: "specific", subtopic: "meal-prep-systems", contentTypes: ["tutorials"] },
      { query: "micronutrient density and energy balance guide", specificity: "specific", subtopic: "metabolic-health", contentTypes: ["educational"] },
      { query: "carbohydrate timing glycogen replenishment athletic", specificity: "specific", subtopic: "macronutrient-science", contentTypes: ["educational"] },
      // Discovery
      { query: "metabolic flexibility nutrient partitioning science", specificity: "discovery", subtopic: "metabolic-health", contentTypes: ["educational", "discussions"] },
      { query: "sports nutrition periodization performance research", specificity: "discovery", subtopic: "macronutrient-science", contentTypes: ["educational"] },
      { query: "gut microbiome diet interaction evidence", specificity: "discovery", subtopic: "metabolic-health", contentTypes: ["educational"] },
    ],
    creatorGuidance: [
      {
        id: "nutrition-dietitians",
        topicId: "nutrition",
        subtopicId: "macronutrient-science",
        instruction: "Find registered dietitians or sports nutritionists who explain nutrient timing with peer-reviewed research.",
        whatToLookFor: [
          "Citations to peer-reviewed nutritional trials",
          "Focus on sustainable eating habits rather than restrictive fads",
          "Clear disclosure of any product sponsorships",
        ],
        searchQuery: "sports nutrition science evidence based meal planning dietitian",
      },
    ],
    contentTypes: ["educational", "tutorials", "discussions"],
  },

  running: {
    id: "running",
    name: "Running",
    aliases: ["jogging", "marathon", "trail running", "track", "distance running"],
    description: "Distance running, marathon preparation, running biomechanics, and aerobic conditioning",
    relatedTopics: ["fitness", "strength-training", "nutrition"],
    subtopics: [
      {
        id: "running-mechanics",
        name: "Running Form & Cadence",
        description: "Gait analysis, cadence optimization, foot strike, and posture",
        related: ["marathon-endurance"],
        keywords: ["cadence", "gait", "footstrike", "biomechanics"],
        recommendedFormats: ["demonstrations", "tutorials"],
      },
      {
        id: "marathon-endurance",
        name: "Endurance & Marathon Prep",
        description: "Zone 2 aerobic base building, weekly long runs, and taper planning",
        related: ["running-mechanics"],
        keywords: ["zone 2", "long run", "marathon", "taper", "aerobic base"],
        recommendedFormats: ["educational", "tutorials"],
      },
      {
        id: "trail-running",
        name: "Trail & Technical Terrain",
        description: "Uphill cadence, descent technique, trail gear, and elevation pacing",
        related: ["marathon-endurance"],
        keywords: ["trail", "elevation", "uphill", "descent", "footwear"],
        recommendedFormats: ["demonstrations", "tutorials"],
      },
    ],
    searches: [
      // Broad
      { query: "running fundamentals", specificity: "broad", contentTypes: ["educational", "tutorials"] },
      { query: "half marathon training plan", specificity: "broad", contentTypes: ["tutorials"] },
      { query: "running form basics", specificity: "broad", contentTypes: ["tutorials"] },
      // Specific
      { query: "running form analysis cadence footstrike breakdown", specificity: "specific", subtopic: "running-mechanics", contentTypes: ["demonstrations", "tutorials"] },
      { query: "zone 2 heart rate training endurance running", specificity: "specific", subtopic: "marathon-endurance", contentTypes: ["educational"] },
      { query: "marathon pacing strategy nutrition hydration", specificity: "specific", subtopic: "marathon-endurance", contentTypes: ["tutorials"] },
      { query: "trail running uphill mechanical efficiency", specificity: "specific", subtopic: "trail-running", contentTypes: ["demonstrations"] },
      // Discovery
      { query: "running economy biomechanics VO2 max study", specificity: "discovery", subtopic: "running-mechanics", contentTypes: ["educational", "discussions"] },
      { query: "lactate threshold interval protocol science", specificity: "discovery", subtopic: "marathon-endurance", contentTypes: ["educational"] },
      { query: "plantar fasciitis shin splints running rehab", specificity: "discovery", subtopic: "running-mechanics", contentTypes: ["tutorials"] },
    ],
    creatorGuidance: [
      {
        id: "running-coaches",
        topicId: "running",
        subtopicId: "running-mechanics",
        instruction: "Look for running coaches who demonstrate and explain running technique with biomechanical breakdowns.",
        whatToLookFor: [
          "Slow-motion gait breakdown and side-by-side angle analysis",
          "Actionable cadence and posture cues",
          "Focus on training consistency rather than shoe hype",
        ],
        searchQuery: "running coach gait analysis technique demonstration biomechanics",
      },
    ],
    contentTypes: ["tutorials", "demonstrations", "educational"],
  },

  "gaming-hardware": {
    id: "gaming-hardware",
    name: "Gaming Hardware",
    aliases: ["pc hardware", "gpu benchmarks", "custom pc build", "pc components"],
    description: "PC gaming components, GPU architecture, cooling, benchmarks, and display technology",
    relatedTopics: ["gaming", "technology"],
    subtopics: [
      {
        id: "gpu-benchmarks",
        name: "GPU Architecture & Benchmarks",
        description: "Frametimes, 1% lows, thermals, rasterization, and ray tracing",
        related: ["pc-building"],
        keywords: ["gpu", "rtx", "benchmarks", "frametimes", "fps"],
        recommendedFormats: ["reviews", "educational"],
      },
      {
        id: "pc-building",
        name: "Custom PC Building",
        description: "Component pairing, power delivery, cooling optimization, and assembly",
        related: ["gpu-benchmarks"],
        keywords: ["pc build", "motherboard", "cooling", "power supply"],
        recommendedFormats: ["tutorials", "project-walkthroughs"],
      },
      {
        id: "peripherals-monitors",
        name: "Monitors & Latency",
        description: "Panel technology, refresh rates, response times, and input latency",
        related: ["gpu-benchmarks"],
        keywords: ["oled", "ips", "refresh rate", "response time", "input lag"],
        recommendedFormats: ["reviews", "educational"],
      },
    ],
    searches: [
      // Broad
      { query: "gaming pc hardware basics", specificity: "broad", contentTypes: ["educational", "tutorials"] },
      { query: "pc component selection guide", specificity: "broad", contentTypes: ["tutorials"] },
      { query: "gaming graphics cards explained", specificity: "broad", contentTypes: ["educational"] },
      // Specific
      { query: "gpu benchmark framerate 1 percent lows comparison", specificity: "specific", subtopic: "gpu-benchmarks", contentTypes: ["reviews", "educational"] },
      { query: "custom pc build cable management airflow tutorial", specificity: "specific", subtopic: "pc-building", contentTypes: ["tutorials"] },
      { query: "monitor response time refresh rate input latency", specificity: "specific", subtopic: "peripherals-monitors", contentTypes: ["educational", "reviews"] },
      { query: "cpu thermal throttling cooler comparison", specificity: "specific", subtopic: "pc-building", contentTypes: ["reviews"] },
      // Discovery
      { query: "gpu architecture compute shader silicon analysis", specificity: "discovery", subtopic: "gpu-benchmarks", contentTypes: ["educational", "discussions"] },
      { query: "pc thermal dynamics liquid cooling overclocking", specificity: "discovery", subtopic: "pc-building", contentTypes: ["tutorials"] },
      { query: "frame pacing display latency measurement deep dive", specificity: "discovery", subtopic: "peripherals-monitors", contentTypes: ["educational"] },
    ],
    creatorGuidance: [
      {
        id: "hardware-benchmarkers",
        topicId: "gaming-hardware",
        subtopicId: "gpu-benchmarks",
        instruction: "Look for hardware reviewers who measure frametimes, 1% lows, and power consumption under controlled methodology.",
        whatToLookFor: [
          "Standardized test benches and methodology transparency",
          "Frametime percentile graphs rather than average FPS alone",
          "Objective price-to-performance assessments",
        ],
        searchQuery: "pc hardware benchmarks frametimes 1 percent lows methodology",
      },
    ],
    contentTypes: ["reviews", "tutorials", "educational"],
  },

  "game-analysis": {
    id: "game-analysis",
    name: "Game Analysis",
    aliases: ["game design", "game mechanics", "ludology", "level design"],
    description: "Game design theory, ludonarrative harmony, level pacing, and mechanical depth",
    relatedTopics: ["gaming", "design"],
    subtopics: [
      {
        id: "level-pacing",
        name: "Level Design & Pacing",
        description: "Spatial flow, environmental cues, difficulty curves, and encounter design",
        related: ["mechanics-systems"],
        keywords: ["level design", "pacing", "spatial cues", "encounter design"],
        recommendedFormats: ["educational", "discussions"],
      },
      {
        id: "mechanics-systems",
        name: "Mechanics & Systems Design",
        description: "Core loops, risk/reward dynamics, animation cancellation, and player feedback",
        related: ["level-pacing"],
        keywords: ["gameplay loop", "mechanics", "risk reward", "feel"],
        recommendedFormats: ["educational", "tutorials"],
      },
      {
        id: "interactive-narrative",
        name: "Interactive Narrative",
        description: "Ludonarrative alignment, environmental storytelling, and non-linear arcs",
        related: ["level-pacing"],
        keywords: ["ludonarrative", "storytelling", "environmental narrative", "dialogue"],
        recommendedFormats: ["discussions", "educational"],
      },
    ],
    searches: [
      // Broad
      { query: "game design principles", specificity: "broad", contentTypes: ["educational"] },
      { query: "game mechanics breakdown", specificity: "broad", contentTypes: ["educational"] },
      { query: "video game analysis", specificity: "broad", contentTypes: ["discussions"] },
      // Specific
      { query: "level design pacing environmental storytelling case study", specificity: "specific", subtopic: "level-pacing", contentTypes: ["educational"] },
      { query: "gameplay loop risk reward mechanics breakdown", specificity: "specific", subtopic: "mechanics-systems", contentTypes: ["educational"] },
      { query: "interactive narrative world building techniques", specificity: "specific", subtopic: "interactive-narrative", contentTypes: ["educational", "discussions"] },
      { query: "boss fight design telegraphing player feedback", specificity: "specific", subtopic: "mechanics-systems", contentTypes: ["educational"] },
      // Discovery
      { query: "ludonarrative design deep dive video essay", specificity: "discovery", subtopic: "interactive-narrative", contentTypes: ["discussions"] },
      { query: "emergent gameplay systems engineering analysis", specificity: "discovery", subtopic: "mechanics-systems", contentTypes: ["educational"] },
      { query: "combat system hitpause animation frame data study", specificity: "discovery", subtopic: "mechanics-systems", contentTypes: ["educational"] },
    ],
    creatorGuidance: [
      {
        id: "game-design-critics",
        topicId: "game-analysis",
        subtopicId: "mechanics-systems",
        instruction: "Find game design analysts and video essayists who dissect mechanics and level design with practical examples.",
        whatToLookFor: [
          "Detailed deconstruction of game feel, camera, and input response",
          "Direct references to design documents and postmortems",
          "Zero sensational gaming industry controversy or drama",
        ],
        searchQuery: "game design analysis video essay level mechanics breakdown",
      },
    ],
    contentTypes: ["educational", "discussions", "tutorials"],
  },

  wildlife: {
    id: "wildlife",
    name: "Wildlife",
    aliases: ["wildlife biology", "animal behavior", "zoology", "nature observation"],
    description: "Wildlife biology, animal behavior, field observation, and conservation ecology",
    relatedTopics: ["cats", "photography", "science"],
    subtopics: [
      {
        id: "animal-ethology",
        name: "Animal Behavior & Ethology",
        description: "Social dynamics, signaling cues, foraging strategies, and vocalizations",
        related: ["field-observation"],
        keywords: ["ethology", "animal behavior", "signaling", "foraging"],
        recommendedFormats: ["educational", "demonstrations"],
      },
      {
        id: "field-observation",
        name: "Field Observation & Tracking",
        description: "Non-invasive tracking, habitat signs, bird flyways, and ethical field craft",
        related: ["animal-ethology"],
        keywords: ["tracking", "field signs", "flyways", "ethics"],
        recommendedFormats: ["tutorials", "demonstrations"],
      },
      {
        id: "conservation-ecology",
        name: "Conservation Ecology",
        description: "Trophic cascades, keystone species, habitat restoration, and biodiversity",
        related: ["animal-ethology"],
        keywords: ["trophic cascade", "keystone species", "biodiversity", "ecology"],
        recommendedFormats: ["educational", "discussions"],
      },
    ],
    searches: [
      // Broad
      { query: "wildlife observation basics", specificity: "broad", contentTypes: ["educational"] },
      { query: "animal behavior fundamentals", specificity: "broad", contentTypes: ["educational"] },
      { query: "nature wildlife documentary", specificity: "broad", contentTypes: ["educational"] },
      // Specific
      { query: "wildlife tracking field signs animal behavior", specificity: "specific", subtopic: "field-observation", contentTypes: ["demonstrations", "tutorials"] },
      { query: "predator prey dynamics habitat ecology study", specificity: "specific", subtopic: "conservation-ecology", contentTypes: ["educational"] },
      { query: "ethical wildlife photography distance observation", specificity: "specific", subtopic: "field-observation", contentTypes: ["tutorials"] },
      { query: "bird migration flyway navigation science", specificity: "specific", subtopic: "animal-ethology", contentTypes: ["educational"] },
      // Discovery
      { query: "ethology animal communication vocalization research", specificity: "discovery", subtopic: "animal-ethology", contentTypes: ["educational"] },
      { query: "keystone species ecosystem trophic cascade deep dive", specificity: "discovery", subtopic: "conservation-ecology", contentTypes: ["educational", "discussions"] },
      { query: "nocturnal animal sensory adaptation biological study", specificity: "discovery", subtopic: "animal-ethology", contentTypes: ["educational"] },
    ],
    creatorGuidance: [
      {
        id: "field-biologists",
        topicId: "wildlife",
        subtopicId: "field-observation",
        instruction: "Explore naturalists and field biologists who demonstrate ethical wildlife observation and behavioral tracking.",
        whatToLookFor: [
          "Emphasis on ethical distance and non-intrusive observation",
          "Scientific explanation of animal posture and alarm calls",
          "Respect for fragile habitats and conservation ethics",
        ],
        searchQuery: "field biologist wildlife observation animal behavior tracking ethical",
      },
    ],
    contentTypes: ["educational", "demonstrations", "discussions"],
  },
};
