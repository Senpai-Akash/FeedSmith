# FEEDSMITH — RECOMMENDATION QUALITY & VALIDATION LAB REPORT
Generated: 2026-10-11T13:53:41.174Z

## 1. Executive Summary

- **Profiles Evaluated:** 8 synthetic test personas (A through H)
- **7-Day Training Plans Generated:** 8
- **Discovery Feeds Generated:** 56 (7 days per persona)
- **ML / AI Dependency:** None (100% deterministic, rule-based recommendation logic)

## 2. Topic Relevance Distribution

| Relationship Category | Count | Percentage |
| :--- | :--- | :--- |
| Direct Match | 790 | 99.1% |
| Related Topic | 0 | 0.0% |
| Weak Relationship | 7 | 0.9% |
| Unrelated | 0 | 0.0% |
| Conflicts with Suppression | 0 | 0.0% |
| **Total Items Evaluated** | **797** | **100.0%** |

## 3. Suppression & Filtering Quality

- **Suppression Conflicts Detected:** 0
- **Result:** PASS. Suppressed categories are strictly excluded from positive recommendations.

## 4. Search Query Quality

- **Total Duplicate Search Queries Across Week:** 0
- **Result:** PASS. No duplicate search queries generated across training days.

## 5. Explanation Validation

- **Validation Failures:** 0
- **Result:** PASS. All explanations are grounded in user profile inputs without unsupported algorithmic claims.

## 6. Discovery Catalog Audit

- **Total Catalog Topics:** 23
- **Total Subtopics:** 92
- **Total Curated Searches:** 233
- **Total Curated Creators:** 15
- **Duplicate Topic IDs:** 0
- **Duplicate Subtopic IDs:** 0
- **Duplicate Search Queries:** 0
- **Missing Required Fields:** 0
- **Invalid Platforms:** 0
- **Malformed URLs:** 0
- **Topics Without Creators in Catalog:** science, business, music, photography, movies, travel, space, startups, cybersecurity, technology, linux, strength-training, nutrition, running, gaming-hardware, game-analysis, wildlife

## 7. Adaptive Feedback Engine Invariants

- **MORE feedback increases strength:** PASS
- **LESS feedback decreases strength:** PASS
- **USEFUL feedback increases strength:** PASS
- **NOT_USEFUL feedback decreases strength:** PASS
- **Adjustments Bounded [-25, +25]:** PASS
- **Subtopic Deltas Bounded [-30, +30]:** PASS
- **Base Blueprint Immutability:** PASS
- **Adaptive Explanation Correspondence:** PASS

## 8. Differentiation Across Personas

- **Persona A (Software) vs Persona D (Animals & Photography):** Overlap Ratio = 0.0% (DISTINCT)
- **Persona B (Fitness) vs Persona C (Gaming):** Overlap Ratio = 0.0% (DISTINCT)
- **Persona A (Software) vs Persona B (Fitness):** Overlap Ratio = 0.0% (DISTINCT)

## 9. Catalog Metadata Limitations

- All evaluated topics have complete metadata coverage in DISCOVERY_TOPICS.

## 10. Per-Persona Breakdown

### Software Development (persona-a)
- **Total Actions:** 63
- **Direct Match / Related Items:** 133 / 133
- **Action Counts by Type:** WATCH: 21, SEARCH: 14, SUBSCRIBE: 12, ENGAGE: 7, AVOID: 9
- **Topic Distribution in Actions:** ai: 33, programming: 12, linux: 9
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Fitness (persona-b)
- **Total Actions:** 58
- **Direct Match / Related Items:** 121 / 121
- **Action Counts by Type:** WATCH: 21, SEARCH: 14, SUBSCRIBE: 11, ENGAGE: 7, AVOID: 5
- **Topic Distribution in Actions:** fitness: 32, strength-training: 12, nutrition: 9
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Gaming (persona-c)
- **Total Actions:** 58
- **Direct Match / Related Items:** 121 / 121
- **Action Counts by Type:** WATCH: 21, SEARCH: 14, SUBSCRIBE: 11, ENGAGE: 7, AVOID: 5
- **Topic Distribution in Actions:** gaming: 32, gaming-hardware: 12, game-analysis: 9
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Animals and Photography (persona-d)
- **Total Actions:** 59
- **Direct Match / Related Items:** 129 / 129
- **Action Counts by Type:** WATCH: 21, SEARCH: 14, SUBSCRIBE: 12, ENGAGE: 7, AVOID: 5
- **Topic Distribution in Actions:** cats: 33, wildlife: 12, photography: 9
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Single Interest (persona-e)
- **Total Actions:** 38
- **Direct Match / Related Items:** 94 / 94
- **Action Counts by Type:** WATCH: 7, SEARCH: 7, SUBSCRIBE: 12, ENGAGE: 7, AVOID: 5
- **Topic Distribution in Actions:** ai: 33
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Many Interests (persona-f)
- **Total Actions:** 80
- **Direct Match / Related Items:** 150 / 150
- **Action Counts by Type:** WATCH: 42, SEARCH: 14, SUBSCRIBE: 12, ENGAGE: 7, AVOID: 5
- **Topic Distribution in Actions:** ai: 33, programming: 12, gaming: 9, fitness: 7, music: 7, photography: 7
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Conflicting Preferences (persona-g)
- **Total Actions:** 42
- **Direct Match / Related Items:** 42 / 42
- **Action Counts by Type:** WATCH: 7, SEARCH: 7, SUBSCRIBE: 11, ENGAGE: 7, AVOID: 10
- **Topic Distribution in Actions:** gaming: 32
- **Duplicate Queries:** 0
- **Suppression Violations:** 0

### Empty or Partial Profile (persona-h)
- **Total Actions:** 7
- **Direct Match / Related Items:** 0 / 7
- **Action Counts by Type:** ENGAGE: 7
- **Topic Distribution in Actions:** None
- **Duplicate Queries:** 0
- **Suppression Violations:** 0
