"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  calculateDayProgress,
  calculatePlanProgress,
  generateFeedTrainingPlan,
  normalizeCompletedActions,
} from "@/lib/feed/training";
import { generateSignalBlueprint } from "@/lib/feed/blueprint";
import { loadPreferences, normalizePreferences } from "@/lib/feed/preferences";
import {
  FeedPreferences,
  FeedTrainingDay,
  TrainingAction,
  TrainingActionType,
} from "@/lib/feed/types";
import {
  getDiscoveryTopic,
  selectCreators,
  generateSearchExplanation,
  generateCreatorExplanation,
} from "@/lib/feed/discoverySelection";
import {
  calculateConsistency,
  calculateOverallProgress,
  calculateTopicsReinforced,
  clearTrainingHistoryMeta,
  createTrainingHistoryMeta,
  deriveTrainingHistory,
  getDayProgressPercent,
  isActionableTrainingAction,
  loadTrainingHistoryMeta,
  saveTrainingHistoryMeta,
  updateTrainingHistoryMeta,
  calculateConsistency,
  type TrainingHistoryMeta,
} from "@/lib/feed/history";

const PROGRESS_STORAGE_KEY = "feedTrainingProgress";

type TrainingProgress = {
  planKey: string;
  completed: Record<string, boolean>;
};

const ACTION_ORDER: TrainingActionType[] = [
  "WATCH",
  "SEARCH",
  "FOLLOW",
  "SUBSCRIBE",
  "ENGAGE",
  "AVOID",
];

const ACTION_LABELS: Record<TrainingActionType, string> = {
  WATCH: "WATCH",
  SEARCH: "SEARCH",
  FOLLOW: "FOLLOW",
  SUBSCRIBE: "SUBSCRIBE",
  ENGAGE: "ENGAGE",
  AVOID: "AVOID",
};

function loadTrainingProgress(planKey: string): TrainingProgress {
  if (typeof window === "undefined") {
    return { planKey, completed: {} };
  }

  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { planKey, completed: {} };

    const parsed = JSON.parse(raw) as Partial<TrainingProgress>;
    const safeCompleted = normalizeCompletedActions(parsed.completed);

    if (parsed.planKey !== planKey) {
      return { planKey, completed: {} };
    }

    return {
      planKey,
      completed: safeCompleted,
    };
  } catch {
    return { planKey, completed: {} };
  }
}

function saveTrainingProgress(progress: TrainingProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function planStorageKey(days: FeedTrainingDay[]): string {
  return days
    .flatMap(day => day.actions.map(action => action.id))
    .join("|");
}

function groupedActions(day: FeedTrainingDay): [TrainingActionType, TrainingAction[]][] {
  return ACTION_ORDER.map(
    (type): [TrainingActionType, TrainingAction[]] => [
      type,
      day.actions.filter(action => action.type === type),
    ]
  ).filter(([, actions]) => actions.length > 0);
}

function actionDetail(action: TrainingAction): string | undefined {
  if (action.type === "WATCH") {
    return `${action.contentPreferenceName} · ${action.platform}`;
  }

  if (action.type === "SEARCH") {
    return action.topicName;
  }

  if (action.type === "FOLLOW" || action.type === "SUBSCRIBE") {
    return `${action.topicName} · ${action.creator.platform}`;
  }

  return undefined;
}

/**
 * Get subtopics for an interest using the discovery library.
 */
function getSubtopicsList(interestId: string, maxCount: number = 3): Array<{ id: string; name: string }> {
  try {
    const topic = getDiscoveryTopic(interestId);
    if (!topic || topic.subtopics.length === 0) {
      return [];
    }
    return topic.subtopics.slice(0, maxCount).map(st => ({
      id: st.id,
      name: st.name,
    }));
  } catch {
    return [];
  }
}

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<FeedPreferences>({
    interests: [],
    contentPreferences: [],
    filters: [],
  });
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [progress, setProgress] = useState<TrainingProgress>({
    planKey: "",
    completed: {},
  });
  const [history, setHistory] = useState<TrainingHistory>(createTrainingHistory());
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = loadPreferences();
      setPrefs(normalizePreferences(stored));
      setHasLoadedPreferences(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const blueprint = useMemo(() => generateSignalBlueprint(prefs), [prefs]);
  const plan = useMemo(() => generateFeedTrainingPlan(blueprint), [blueprint]);
  const storageKey = useMemo(() => planStorageKey(plan.days), [plan.days]);
  const currentDay = plan.days[Math.min(dayIndex, plan.days.length - 1)] ?? plan.days[0];
  const sortedInterests = useMemo(
    () => [...prefs.interests].sort((a, b) => b.strength - a.strength),
    [prefs.interests]
  );
  const sortedContentPreferences = useMemo(
    () =>
      [...(prefs.contentPreferences ?? [])].sort(
        (a, b) => b.strength - a.strength || a.name.localeCompare(b.name)
      ),
    [prefs.contentPreferences]
  );

  useEffect(() => {
    if (!hasLoadedPreferences) return;
    const timeout = window.setTimeout(() => {
      setProgress(loadTrainingProgress(storageKey));
      const loadedHistory = loadTrainingHistory();
      setHistory(loadedHistory);
      setHasLoadedHistory(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [hasLoadedPreferences, storageKey]);

  useEffect(() => {
    if (!progress.planKey) return;
    saveTrainingProgress(progress);
  }, [progress]);

  // Update history when plan changes or day is accessed
  useEffect(() => {
    if (!hasLoadedHistory || currentDay.actions.length === 0) return;
    const updatedHistory = ensureDayHistory(history, currentDay);
    if (updatedHistory !== history) {
      setHistory(updatedHistory);
      saveTrainingHistory(updatedHistory);
    }
  }, [hasLoadedHistory, currentDay, history]);

  const currentDayProgress = calculateDayProgress(currentDay, progress.completed);
  const overallPlanProgress = calculatePlanProgress(plan, progress.completed);

  // Training history metrics
  const consistency = useMemo(
    () => (hasLoadedHistory ? calculateConsistency(history) : { daysCompleted: 0, elapsedDays: 0, percentage: 0, message: "Start Day 1 to begin tracking your consistency." }),
    [history, hasLoadedHistory]
  );

  const topicsReinforced = useMemo(
    () => (hasLoadedHistory ? calculateTopicsReinforced(history, plan.days) : []),
    [history, plan.days, hasLoadedHistory]
  );

  const overallProgress = useMemo(
    () => (hasLoadedHistory ? calculateOverallProgress(history, plan.days) : { daysCompleted: 0, totalDays: 7, daysPercentage: 0, actionsCompleted: 0, totalActions: 0, actionsPercentage: 0 }),
    [history, plan.days, hasLoadedHistory]
  );

  const trainingStatus = useMemo(
    () => (hasLoadedHistory ? getTrainingStatus(history, currentDay.actions) : "NOT_STARTED"),
    [history, currentDay.actions, hasLoadedHistory]
  );

  const toggleAction = (actionId: string) => {
    const newCompleted = {
      ...progress.completed,
      [actionId]: !progress.completed[actionId],
    };
    setProgress(current => ({
      planKey: storageKey,
      completed: newCompleted,
    }));

    // Update history to track action completion and topics reinforced
    const action = plan.days
      .flatMap(d => d.actions)
      .find(a => a.id === actionId);
    
    if (action && hasLoadedHistory) {
      const updatedHistory = updateHistoryForAction(
        history,
        action,
        !progress.completed[actionId],
        plan.days,
        newCompleted
      );
      setHistory(updatedHistory);
      saveTrainingHistory(updatedHistory);
    }
  };

  const handleResetTraining = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    
    // Actually reset
    setProgress({ planKey: storageKey, completed: {} });
    setHistory(resetTrainingHistory());
    saveTrainingHistory(resetTrainingHistory());
    setDayIndex(0);
    setShowResetConfirm(false);
  };

  const discoveryInterests = useMemo(
    () => sortedInterests.slice(0, 2),
    [sortedInterests]
  );

  const discoveryRecommendations = useMemo(
    () =>
      discoveryInterests.map(interest => {
        const topic = getDiscoveryTopic(interest.id);
        const searches = topic
          ? topic.searches
              .filter(query => query.specificity !== "discovery" || interest.strength > 60)
              .slice(0, 3)
              .map(query => ({
                label: query.query,
                why: generateSearchExplanation(interest, sortedContentPreferences, true),
              }))
          : [{ label: `${interest.name} tutorials`, why: generateSearchExplanation(interest, sortedContentPreferences, true) }];

        const creators = selectCreators(
          [interest],
          2,
          sortedContentPreferences,
          dayIndex
        );

        const explore = topic
          ? topic.subtopics.slice(0, 3).map(subtopic => ({
              id: subtopic.id,
              name: subtopic.name,
            }))
          : [];

        return {
          interest,
          searches,
          creators,
          explore,
        };
      }),
    [dayIndex, discoveryInterests, sortedContentPreferences]
  );

  if (!hasLoadedPreferences || !hasLoadedHistory) {
    return (
      <main className="min-h-screen bg-[#08050f] text-white" />
    );
  }

  if (sortedInterests.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08050f] px-6 text-white">
        <div className="max-w-md text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/35">
            FeedSmith
          </p>
          <h1 className="mt-4 text-3xl font-medium">No signal built yet</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Choose the topics you want first, then FeedSmith can turn them into
            a practical feed training plan.
          </p>
          <Link
            href="/build"
            className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
          >
            Build your signal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#08050f] text-white">
      <section className="relative px-6 py-8 md:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_78%_14%,rgba(45,212,191,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_42%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-3 pb-2">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/40">FeedSmith</p>
            <h1 className="mt-1 text-3xl font-medium leading-tight md:text-5xl">Your personalized feed training plan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{plan.summary}</p>
          </header>

          {/* PRIMARY: Today's mission (dominant) */}
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-lg backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-200/70">Today&apos;s mission</p>
                  <AnimatePresence mode="wait">
                    <motion.div key={currentDay.day} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                      <h2 className="mt-3 text-2xl font-semibold md:text-4xl">Day {currentDay.day} · {currentDay.stage}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/56"><span className="text-white/80">Your goal:</span> {currentDay.goal}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" aria-label="previous day" disabled={dayIndex === 0} onClick={() => setDayIndex(i => Math.max(0, i - 1))} className="rounded-full border border-white/15 px-3 py-2 text-sm text-white/70 hover:border-white/30 disabled:opacity-30">←</button>
                  <div className="text-center">
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-white/38">Day {currentDay.day} of 7</div>
                    <div className="mt-1 text-sm text-white/65">{currentDayProgress.completedCount} / {currentDay.actions.length} actions</div>
                  </div>
                  <button type="button" aria-label="next day" disabled={dayIndex === plan.days.length - 1} onClick={() => setDayIndex(i => Math.min(plan.days.length - 1, i + 1))} className="rounded-full border border-white/15 px-3 py-2 text-sm text-white/70 hover:border-white/30 disabled:opacity-30">→</button>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {groupedActions(currentDay).map(([type, actions]) => (
                  <section key={type} aria-labelledby={`section-${type.toLowerCase()}`}>
                    <h3 id={`section-${type.toLowerCase()}`} className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-white/36">{ACTION_LABELS[type]}</h3>
                    <div className="grid gap-3">
                      {actions.map(action => {
                        const complete = Boolean(progress.completed[action.id]);
                        const detail = actionDetail(action);

                        return (
                          <label key={action.id} className={`group flex items-start gap-4 rounded-md border p-3 transition ${complete ? 'border-teal-200/30 bg-teal-200/[0.06]' : 'border-white/8 bg-white/[0.02] hover:border-white/22 hover:bg-white/[0.04]'}`}>
                            <input aria-label={action.title} type="checkbox" checked={complete} onChange={() => toggleAction(action.id)} className="mt-1 h-5 w-5 flex-shrink-0 accent-teal-200" />
                            <div className="min-w-0">
                              <div className={`flex items-baseline justify-between gap-3`}> 
                                <span className={`block text-sm font-medium ${complete ? 'text-white/50 line-through' : 'text-white'}`}>{action.title}</span>
                                {action.type === 'WATCH' && 'count' in action && (
                                  <span className="text-xs tabular-nums text-white/45">{action.count}</span>
                                )}
                              </div>
                              <div className="mt-1 text-sm text-white/55">{action.description}</div>
                              {detail || action.why ? (
                                <div className="mt-2 text-xs text-white/35">{detail ? `${detail}. ` : ''}{action.why}</div>
                              ) : null}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* Right column: compact plan nav + quick progress */}
            <aside className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">Progress</h4>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Day {currentDay.day} progress</div>
                    <div className="text-sm tabular-nums text-white/70">{currentDayProgress.progressPercent}%</div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${currentDayProgress.progressPercent}%` }} />
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/45">{currentDayProgress.completedCount} / {currentDayProgress.totalActions} actions complete</div>
                <div className="mt-3 border-t border-white/8 pt-3 text-xs text-white/45">
                  Overall plan: {overallPlanProgress.completedCount} / {overallPlanProgress.totalActions} actions complete · {overallPlanProgress.progressPercent}%
                </div>
                <button
                  type="button"
                  onClick={handleResetTraining}
                  className={`mt-3 inline-flex rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition ${
                    showResetConfirm
                      ? 'border-red-400/50 bg-red-500/10 text-red-300 hover:border-red-400/70 hover:bg-red-500/20'
                      : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {showResetConfirm ? 'Confirm reset' : 'Reset training'}
                </button>
                {showResetConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="mt-2 inline-flex rounded-full border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/60 transition hover:border-white/30 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">7‑day plan</h4>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {plan.days.map((d: FeedTrainingDay, i: number) => (
                    <button key={d.day} onClick={() => setDayIndex(i)} aria-current={i === dayIndex} className={`rounded-md py-2 text-center text-xs font-medium transition ${i === dayIndex ? 'bg-violet-300/20 border border-violet-300/40 text-white' : 'bg-white/[0.02] border border-white/6 text-white/60 hover:bg-white/[0.035]'}`}>
                      <div className="tabular-nums">{String(d.day).padStart(2, '0')}</div>
                      <div className="mt-1 text-[10px] text-white/50 leading-4">{d.stage}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <h4 className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">Your signal</h4>
                <div className="mt-3 text-sm">
                  {sortedInterests.slice(0,4).map(i => (
                    <div key={i.id} className="flex items-center justify-between py-1">
                      <div className="text-sm text-white/75">{i.name}</div>
                      <div className="tabular-nums text-white">{i.strength}</div>
                    </div>
                  ))}
                </div>

                {/* Key Areas from Discovery Library */}
                {sortedInterests.length > 0 && (
                  <div className="mt-3 border-t border-white/8 pt-3">
                    <h5 className="text-xs font-medium uppercase tracking-[0.15em] text-white/25 mb-2">Key areas to explore</h5>
                    <div className="space-y-2">
                      {sortedInterests.slice(0, 2).map(interest => {
                        const subtopics = getSubtopicsList(interest.id, 2);
                        if (subtopics.length === 0) return null;
                        return (
                          <div key={interest.id} className="text-xs">
                            <div className="text-white/50 mb-1">{interest.name}</div>
                            <div className="flex flex-wrap gap-1">
                              {subtopics.map(st => (
                                <div
                                  key={st.id}
                                  className="rounded-full bg-white/[0.05] px-2 py-0.5 text-white/40 text-[10px]"
                                >
                                  {st.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sortedContentPreferences.length > 0 && (
                  <div className="mt-3 text-xs text-white/45">
                    {sortedContentPreferences.slice(0,3).map(c => (
                      <div key={c.id} className="flex items-center justify-between py-0.5"><div>{c.name}</div><div className="tabular-nums">{c.strength}</div></div>
                    ))}
                  </div>
                )}
                {prefs.filters && prefs.filters.length > 0 && (
                  <div className="mt-3 text-xs text-white/45">
                    <div className="font-medium text-white/70 mb-1">Suppress</div>
                    <div className="flex flex-wrap gap-2">
                      {prefs.filters.map(f => (
                        <div key={f} className="rounded-full bg-white/[0.03] px-2 py-1 text-xs">{f}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </section>

          {/* Training Progress Section */}
          <section className="grid gap-4 lg:grid-cols-3">
            {/* Overall Training Status */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">
                Training Status
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-white">
                    Day {history.currentDay} {history.currentDay <= 7 ? "of 7" : ""}
                  </div>
                  {history.trainingComplete ? (
                    <div className="mt-1 text-xs text-green-300/80">✓ Training Complete</div>
                  ) : history.currentDay <= 7 ? (
                    <div className="mt-1 text-xs text-white/55">
                      {trainingStatus === "DAY_COMPLETE" ? "✓ Complete" : "In progress"}
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-white/8 pt-3">
                  <div className="text-xs text-white/50">
                    {overallProgress.daysCompleted} / {overallProgress.totalDays} days completed
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${overallProgress.daysPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="border-t border-white/8 pt-3">
                  <div className="text-xs text-white/50">
                    {overallProgress.actionsCompleted} / {overallProgress.totalActions} actions
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-violet-400 transition-all"
                      style={{ width: `${overallProgress.actionsPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Training Consistency */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">
                Consistency
              </h3>
              <div className="mt-4">
                {consistency.daysCompleted === 0 ? (
                  <div className="text-xs leading-5 text-white/50">
                    {consistency.message}
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-medium text-white">
                      {consistency.percentage}%
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      {consistency.message}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Topics Reinforced Summary */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">
                Topics Reinforced
              </h3>
              <div className="mt-4 space-y-2">
                {topicsReinforced.length === 0 ? (
                  <div className="text-xs text-white/50">
                    Complete actions to track topic progress.
                  </div>
                ) : (
                  topicsReinforced.slice(0, 3).map(topic => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <div className="text-xs text-white/70">{topic.displayName}</div>
                      <div className="text-xs tabular-nums text-white/50">
                        {topic.actionCount}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {topicsReinforced.length > 3 && (
                <div className="mt-3 border-t border-white/8 pt-3 text-[10px] text-white/40">
                  +{topicsReinforced.length - 3} more topics
                </div>
              )}
            </div>
          </section>

          {/* Signal Progress - Actions by Topic */}
          {topicsReinforced.length > 0 && (
            <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">
                Signal Progress · FeedSmith Activity
              </h3>
              <div className="mt-4 space-y-3">
                {topicsReinforced.map(topic => {
                  const maxActions = Math.max(...topicsReinforced.map(t => t.actionCount), 1);
                  const percentage = Math.round((topic.actionCount / maxActions) * 100);
                  return (
                    <div key={topic.topic}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-white/80">{topic.displayName}</div>
                        <div className="text-xs tabular-nums text-white/50">
                          {topic.actionCount} action{topic.actionCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-white/8 pt-3 text-[11px] leading-5 text-white/40">
                You've reinforced these interests through FeedSmith training actions. This is not an official platform metric.
              </div>
            </section>
          )}

          {/* Training Timeline */}
          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
              7-day Training Timeline
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-7">
              {plan.days.map((day: FeedTrainingDay) => {
                const dayHistory = history.dailyHistory.find(d => d.day === day.day);
                const isCurrentDay = history.currentDay === day.day;
                const isCompleted = dayHistory?.completedAt !== undefined;
                const isFuture = day.day > history.dailyHistory.length;

                return (
                  <div
                    key={day.day}
                    className={`rounded-md border p-3 text-center transition ${
                      isCompleted
                        ? "border-emerald-200/30 bg-emerald-200/[0.06]"
                        : isCurrentDay
                          ? "border-violet-200/60 bg-violet-300/[0.08]"
                          : isFuture
                            ? "border-white/6 bg-white/[0.01]"
                            : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="text-xs font-medium text-white/60">
                      {isCompleted ? "✓" : isCurrentDay ? "●" : "○"} Day {day.day}
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-white/70">
                      {day.stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Training History Detail */}
          {history.dailyHistory.length > 0 && (
            <section>
              <h2 className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
                Training History
              </h2>
              <div className="mt-4 space-y-2">
                {history.dailyHistory.map(dayRecord => {
                  const dayData = plan.days.find(d => d.day === dayRecord.day);
                  const isCompleted = dayRecord.completedAt !== undefined;

                  return (
                    <div
                      key={dayRecord.day}
                      className={`rounded-md border p-3 transition ${
                        isCompleted
                          ? "border-emerald-200/20 bg-emerald-200/[0.04]"
                          : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              Day {dayRecord.day}
                            </span>
                            <span className="text-xs text-white/50">
                              {dayRecord.stage}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-white/40">
                            {isCompleted ? "✓ Complete" : "In progress"} ·{" "}
                            {dayRecord.completedActions} / {dayRecord.totalActions} actions
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="h-8 w-12 rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isCompleted ? "bg-emerald-400" : "bg-violet-400"
                              }`}
                              style={{
                                width: `${
                                  dayRecord.totalActions > 0
                                    ? Math.round(
                                        (dayRecord.completedActions /
                                          dayRecord.totalActions) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty State */}
          {history.dailyHistory.length === 0 && (
            <section className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/35">
                Training Progress
              </p>
              <h2 className="mt-3 text-lg font-medium text-white">
                You haven't started yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Complete your first action on today's mission to begin tracking your progress and building your training history.
              </p>
            </section>
          )}

          {/* Training Complete State */}
          {history.trainingComplete && (
            <section className="rounded-lg border border-emerald-200/30 bg-emerald-200/[0.06] p-6">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-300/70">
                Training Complete
              </p>
              <h2 className="mt-3 text-2xl font-medium text-white">
                You've completed the FeedSmith training plan
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                You've completed 7 days of intentional signal training. You've reinforced your core interests through {overallProgress.actionsCompleted} completed actions.
              </p>
              {topicsReinforced.length > 0 && (
                <div className="mt-4 pt-4 border-t border-emerald-200/20">
                  <p className="text-xs text-white/50">Most reinforced topics:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {topicsReinforced.slice(0, 3).map(topic => (
                      <div
                        key={topic.topic}
                        className="rounded-full bg-emerald-200/[0.1] px-3 py-1 text-xs text-white/70"
                      >
                        {topic.displayName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs leading-5 text-white/40">
                FeedSmith measured your intentional activity plan, not changes to third-party recommendation algorithms.
              </p>
            </section>
          )}

          {/* Discovery layer: Curated searches, creators, and subtopics */}
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">Search</h3>
              <div className="mt-4 space-y-3">
                {discoveryRecommendations.flatMap(({ interest, searches }) =>
                  searches.map((item, index) => (
                    <div key={`${interest.id}-search-${index}`} className="rounded-md border border-white/8 bg-black/20 p-3">
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <button
                        type="button"
                        className="mt-2 inline-flex rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/50 hover:border-white/25"
                      >
                        Search suggestion
                      </button>
                      <div className="mt-2 text-[11px] leading-5 text-white/40">
                        Why this? {item.why}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">Who to follow</h3>
              <div className="mt-4 space-y-3">
                {discoveryRecommendations.flatMap(({ interest, creators }) =>
                  creators.map(creator => (
                    <div key={`${interest.id}-${creator.id}`} className="rounded-md border border-white/8 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">{creator.name}</div>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">{creator.platform}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-white/45">{creator.topics.join(" · ") || interest.name}</div>
                      <div className="mt-2 text-[11px] leading-5 text-white/40">
                        Why this? {generateCreatorExplanation(creator, [interest])}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-white/35">Explore</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {discoveryRecommendations.flatMap(({ interest, explore }) =>
                  explore.map(subtopic => (
                    <div
                      key={`${interest.id}-${subtopic.id}`}
                      className="rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[11px] text-white/60"
                    >
                      {subtopic.name}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 text-[11px] leading-5 text-white/40">
                These are the subtopics most aligned with your current signal and selected content style.
              </div>
            </div>
          </section>

          {/* 7-day detail grid (expanded) */}
          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">Plan overview</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {plan.days.map((day: FeedTrainingDay, index: number) => (
                <button key={day.day} type="button" onClick={() => setDayIndex(index)} className={`rounded-md border p-4 text-left transition ${index === dayIndex ? 'border-violet-200/60 bg-violet-300/[0.08]' : 'border-white/10 bg-white/[0.012] hover:border-white/25'}`}>
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/40">{String(day.day).padStart(2,'0')}</span>
                  <span className="mt-2 block text-sm font-medium text-white">{day.stage}</span>
                  <span className="mt-1 block text-xs text-white/50">{day.goal}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
