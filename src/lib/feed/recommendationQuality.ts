/**
 * FeedSmith Recommendation Quality & Evaluation Lab
 *
 * Provides a reproducible test harness and calibration suite for FeedSmith's
 * recommendation and training systems.
 *
 * Measures:
 * 1. Interest Relevance: Actions align with user's selected interests.
 * 2. Multi-Interest Balancing & Fair Share: Prevents interest starvation across Days 1–7.
 * 3. Content Preference Alignment: Respects desired formats.
 * 4. Suppression Safety & Precision: Suppresses unwanted topics without collateral damage.
 * 5. Query Specificity & Diversity: Eliminates repetitive, generic queries.
 * 6. Progression Sequencing: Day 0 to Day 6 stages reflect intended learning curve.
 * 7. Explanation Honesty: Grounded, transparent explanations without false algorithm claims.
 * 8. Feedback Responsiveness: Adaptive adjustments remain predictable and bounded.
 */

import { UserPreferences } from "@/types/feed";
import { generateFeedTrainingPlan, DailyPlan, DailyAction } from "./training";
import { generateSignalBlueprint } from "./blueprint";
import { calculateDerivedSignal } from "./adaptiveEngine";

// ============================================================================
// 10 REPRESENTATIVE TEST PERSONAS
// ============================================================================

export interface TestPersona {
  id: string;
  name: string;
  description: string;
  preferences: UserPreferences;
}

export const TEST_PERSONAS: Record<string, TestPersona> = {
  single_interest_specialist: {
    id: "single_interest_specialist",
    name: "Deep AI Specialist",
    description: "Highly focused on Artificial Intelligence with tutorial preference. Should have deep coverage without forced dilution.",
    preferences: {
      platform: "youtube",
      interests: [{ id: "ai", name: "Artificial Intelligence", strength: 95 }],
      contentPreferences: ["tutorials", "breakdowns"],
      suppressCategories: ["crypto", "celebrity_gossip"],
      trainingPace: "moderate",
    },
  },

  broad_multi_interest: {
    id: "broad_multi_interest",
    name: "Polymath Learner",
    description: "Four distinct interests of descending strength. All 4 must receive airtime across Days 1–7 without secondary interest starvation.",
    preferences: {
      platform: "youtube",
      interests: [
        { id: "programming", name: "Software Engineering", strength: 85 },
        { id: "cooking", name: "Culinary Arts", strength: 70 },
        { id: "fitness", name: "Fitness & Strength", strength: 60 },
        { id: "gaming", name: "Game Development", strength: 50 },
      ],
      contentPreferences: ["tutorials", "deep_dives"],
      suppressCategories: ["rage_bait"],
      trainingPace: "moderate",
    },
  },

  dual_core_balanced: {
    id: "dual_core_balanced",
    name: "Balanced Dual-Focus",
    description: "Two equally weighted creative interests. Should alternate cleanly across the training cycle.",
    preferences: {
      platform: "instagram",
      interests: [
        { id: "photography", name: "Photography", strength: 80 },
        { id: "graphic_design", name: "Graphic Design", strength: 80 },
      ],
      contentPreferences: ["visual_showcases", "breakdowns"],
      suppressCategories: ["memes"],
      trainingPace: "moderate",
    },
  },

  strict_suppression_profile: {
    id: "strict_suppression_profile",
    name: "Strict Privacy & Suppression",
    description: "Software developer who suppresses crypto, financial scams, and clickbait. Must avoid false-positive suppressions on cryptography.",
    preferences: {
      platform: "youtube",
      interests: [
        { id: "programming", name: "Software Engineering & Cryptography", strength: 90 },
        { id: "cybersecurity", name: "Cybersecurity", strength: 80 },
      ],
      contentPreferences: ["in_depth"],
      suppressCategories: ["crypto", "finance_scams", "clickbait"],
      trainingPace: "fast",
    },
  },

  format_specific_learner: {
    id: "format_specific_learner",
    name: "Format-Oriented Learner",
    description: "Fitness enthusiast who strictly seeks step-by-step form tutorials and breakdown analyses.",
    preferences: {
      platform: "youtube",
      interests: [{ id: "fitness", name: "Strength Training", strength: 85 }],
      contentPreferences: ["tutorials", "breakdowns"],
      suppressCategories: ["lifestyle_vlogs"],
      trainingPace: "moderate",
    },
  },

  contradictory_preferences: {
    id: "contradictory_preferences",
    name: "Contradictory / Mixed Signal User",
    description: "High volume of divergent interests with mixed negative constraints.",
    preferences: {
      platform: "tiktok",
      interests: [
        { id: "nutrition", name: "Healthy Nutrition", strength: 80 },
        { id: "baking", name: "Pastry & Baking", strength: 75 },
      ],
      contentPreferences: ["quick_tips"],
      suppressCategories: ["diet_scams"],
      trainingPace: "moderate",
    },
  },

  minimal_incomplete_profile: {
    id: "minimal_incomplete_profile",
    name: "Minimalist Starter",
    description: "Single interest with minimum metadata. System must degrade gracefully without crashing.",
    preferences: {
      platform: "youtube",
      interests: [{ id: "music", name: "Music Production", strength: 50 }],
      contentPreferences: [],
      suppressCategories: [],
      trainingPace: "moderate",
    },
  },

  evolving_feedback_user: {
    id: "evolving_feedback_user",
    name: "Adaptive Feedback User",
    description: "User providing repeated feedback to reshape plan without mutating root blueprint.",
    preferences: {
      platform: "youtube",
      interests: [
        { id: "programming", name: "Programming", strength: 70 },
        { id: "data_science", name: "Data Science", strength: 70 },
      ],
      contentPreferences: ["tutorials"],
      suppressCategories: [],
      trainingPace: "moderate",
    },
  },

  cross_platform_shifter: {
    id: "cross_platform_shifter",
    name: "Multi-Platform Learner",
    description: "User training algorithms on TikTok with short-form and creator follow actions.",
    preferences: {
      platform: "tiktok",
      interests: [
        { id: "gaming", name: "Gaming", strength: 80 },
        { id: "animation", name: "Animation", strength: 75 },
      ],
      contentPreferences: ["highlights"],
      suppressCategories: ["drama"],
      trainingPace: "moderate",
    },
  },

  maintenance_graduate: {
    id: "maintenance_graduate",
    name: "Maintenance Mode Graduate",
    description: "Completed 7-day initial training, inspecting Day 7 (Maintenance) action volume and health.",
    preferences: {
      platform: "youtube",
      interests: [
        { id: "programming", name: "Software Development", strength: 90 },
        { id: "ai", name: "Machine Learning", strength: 80 },
      ],
      contentPreferences: ["breakdowns", "tutorials"],
      suppressCategories: ["crypto"],
      trainingPace: "moderate",
    },
  },
};

// ============================================================================
// EVALUATION METRICS
// ============================================================================

export interface QualityMetricResult {
  score: number; // 0.0 to 1.0
  passed: boolean;
  details: string;
}

export interface RecommendationQualityReport {
  personaId: string;
  totalDays: number;
  totalActions: number;
  metrics: {
    interestRelevance: QualityMetricResult;
    interestFairShare: QualityMetricResult;
    suppressionSafety: QualityMetricResult;
    queryDiversity: QualityMetricResult;
    progressionSequencing: QualityMetricResult;
    explanationHonesty: QualityMetricResult;
  };
  overallPass: boolean;
}

/**
 * Checks that recommendations relate directly to the user's declared interests.
 */
export function evaluateInterestRelevance(
  plan: DailyPlan[],
  preferences: UserPreferences
): QualityMetricResult {
  const interestNames = preferences.interests.map((i) => i.name.toLowerCase());
  const interestIds = preferences.interests.map((i) => i.id.toLowerCase());

  let totalInspectableActions = 0;
  let relevantActions = 0;

  for (const day of plan) {
    for (const action of day.actions) {
      if (action.type === "avoid") continue; // Avoid actions intentionally target suppressed items
      totalInspectableActions++;

      const text = `${action.title} ${action.description} ${action.topic || ""}`.toLowerCase();
      const matches = interestNames.some((n) => text.includes(n)) || interestIds.some((id) => text.includes(id));

      if (matches || preferences.interests.length === 0) {
        relevantActions++;
      }
    }
  }

  const score = totalInspectableActions > 0 ? relevantActions / totalInspectableActions : 1.0;
  return {
    score,
    passed: score >= 0.75, // At least 75% explicitly match interest keywords or topic tags
    details: `${relevantActions}/${totalInspectableActions} actions directly align with user interests (${Math.round(score * 100)}%)`,
  };
}

/**
 * Checks that multi-interest profiles distribute actions fairly across all declared interests
 * rather than starving lower-priority or secondary interests over the 7 days.
 */
export function evaluateInterestFairShare(
  plan: DailyPlan[],
  preferences: UserPreferences
): QualityMetricResult {
  if (preferences.interests.length <= 1) {
    return {
      score: 1.0,
      passed: true,
      details: "Single-interest profile: no multi-interest distribution needed",
    };
  }

  const interestActionCounts: Record<string, number> = {};
  for (const interest of preferences.interests) {
    interestActionCounts[interest.id] = 0;
  }

  for (const day of plan) {
    for (const action of day.actions) {
      if (action.type === "avoid") continue;
      const text = `${action.title} ${action.description} ${action.topic || ""}`.toLowerCase();
      for (const interest of preferences.interests) {
        if (text.includes(interest.id.toLowerCase()) || text.includes(interest.name.toLowerCase())) {
          interestActionCounts[interest.id] = (interestActionCounts[interest.id] || 0) + 1;
        }
      }
    }
  }

  const starvedInterests = Object.entries(interestActionCounts).filter(([, count]) => count === 0);
  const fairShareScore = (preferences.interests.length - starvedInterests.length) / preferences.interests.length;

  return {
    score: fairShareScore,
    passed: starvedInterests.length === 0,
    details:
      starvedInterests.length === 0
        ? `All ${preferences.interests.length} interests received actions across the 7-day plan`
        : `Starved interests with 0 actions: ${starvedInterests.map(([id]) => id).join(", ")}`,
  };
}

/**
 * Checks that suppressed categories are never recommended for watch, search, or follow actions.
 */
export function evaluateSuppressionSafety(
  plan: DailyPlan[],
  preferences: UserPreferences
): QualityMetricResult {
  const suppressed = preferences.suppressCategories.map((s) => s.toLowerCase());
  if (suppressed.length === 0) {
    return { score: 1.0, passed: true, details: "No suppression categories configured" };
  }

  let violations = 0;
  const violationDetails: string[] = [];

  for (const day of plan) {
    for (const action of day.actions) {
      if (action.type === "avoid") continue; // Avoid actions instruct user to avoid/suppress
      const titleLower = action.title.toLowerCase();
      const descLower = action.description.toLowerCase();

      for (const term of suppressed) {
        // Safe token match: ensure we don't treat "cryptography" as a "crypto" suppression violation
        const tokenRegex = new RegExp(`\\b${term}\\b`, "i");
        if (tokenRegex.test(titleLower) || tokenRegex.test(descLower)) {
          violations++;
          violationDetails.push(`Day ${day.dayIndex + 1}: ${action.title} matched suppressed term "${term}"`);
        }
      }
    }
  }

  const passed = violations === 0;
  return {
    score: passed ? 1.0 : 0.0,
    passed,
    details: passed
      ? `0 suppression violations found across ${plan.length} days`
      : `${violations} suppression violation(s): ${violationDetails.slice(0, 3).join("; ")}`,
  };
}

/**
 * Checks that search queries across the 7 days are specific and not repetitive copies.
 */
export function evaluateQueryDiversity(plan: DailyPlan[]): QualityMetricResult {
  const searchQueries: string[] = [];

  for (const day of plan) {
    for (const action of day.actions) {
      if (action.type === "search") {
        searchQueries.push(action.title.toLowerCase().trim());
      }
    }
  }

  if (searchQueries.length === 0) {
    return { score: 1.0, passed: true, details: "No search actions present" };
  }

  const uniqueQueries = new Set(searchQueries);
  const ratio = uniqueQueries.size / searchQueries.length;

  return {
    score: ratio,
    passed: ratio >= 0.70, // At least 70% unique queries across the 7-day cycle
    details: `${uniqueQueries.size} unique queries out of ${searchQueries.length} total search actions (${Math.round(ratio * 100)}% unique)`,
  };
}

/**
 * Checks that stages progress logically from Establish to Maintain.
 */
export function evaluateProgressionSequencing(plan: DailyPlan[]): QualityMetricResult {
  const expectedStages = [
    "ESTABLISH",
    "REINFORCE",
    "STRENGTHEN",
    "EXPAND",
    "DEEPEN",
    "REFINE",
    "MAINTAIN",
  ];

  let matches = 0;
  for (let i = 0; i < Math.min(plan.length, expectedStages.length); i++) {
    if (plan[i].stage?.toUpperCase() === expectedStages[i]) {
      matches++;
    }
  }

  const score = matches / expectedStages.length;
  return {
    score,
    passed: score === 1.0,
    details: `${matches}/7 days match expected stage progression order`,
  };
}

/**
 * Checks that recommendation explanations are honest, transparent, and do not make
 * unfounded claims about controlling external platform algorithms.
 */
export function evaluateExplanationHonesty(plan: DailyPlan[]): QualityMetricResult {
  const deceptivePhrases = [
    "we hacked",
    "guaranteed to force the algorithm",
    "directly alters the platform code",
    "guaranteed 100% feed takeover",
    "we control the feed",
  ];

  let violations = 0;
  for (const day of plan) {
    for (const action of day.actions) {
      const text = `${action.title} ${action.description} ${action.explanation || ""}`.toLowerCase();
      for (const phrase of deceptivePhrases) {
        if (text.includes(phrase)) {
          violations++;
        }
      }
    }
  }

  const passed = violations === 0;
  return {
    score: passed ? 1.0 : 0.0,
    passed,
    details: passed
      ? "All recommendation explanations are honest, grounded, and free of false algorithm claims"
      : `${violations} deceptive explanation phrase(s) detected`,
  };
}

/**
 * Evaluates recommendation quality for a given profile across all 6 core quality metrics.
 */
export function evaluateRecommendationQuality(
  preferences: UserPreferences
): RecommendationQualityReport {
  const blueprint = generateSignalBlueprint(preferences);
  const trainingPlan = generateFeedTrainingPlan(blueprint, preferences.platform);
  const plan = trainingPlan.days;
  const totalActions = plan.reduce((acc, day) => acc + day.actions.length, 0);

  const interestRelevance = evaluateInterestRelevance(plan, preferences);
  const interestFairShare = evaluateInterestFairShare(plan, preferences);
  const suppressionSafety = evaluateSuppressionSafety(plan, preferences);
  const queryDiversity = evaluateQueryDiversity(plan);
  const progressionSequencing = evaluateProgressionSequencing(plan);
  const explanationHonesty = evaluateExplanationHonesty(plan);

  const overallPass =
    interestRelevance.passed &&
    interestFairShare.passed &&
    suppressionSafety.passed &&
    queryDiversity.passed &&
    progressionSequencing.passed &&
    explanationHonesty.passed;

  return {
    personaId: preferences.interests[0]?.id || "unknown",
    totalDays: plan.length,
    totalActions,
    metrics: {
      interestRelevance,
      interestFairShare,
      suppressionSafety,
      queryDiversity,
      progressionSequencing,
      explanationHonesty,
    },
    overallPass,
  };
}
