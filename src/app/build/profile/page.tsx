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
  DiscoveryItem,
  FeedPreferences,
  FeedTrainingDay,
  TrainingAction,
  TrainingActionType,
} from "@/lib/feed/types";
import { generatePersonalizedDiscovery } from "@/lib/feed/discoveryEngine";
import {
  DailyHistory,
  calculateConsistency,
  calculateOverallProgress,
  calculateTopicsReinforced,
  clearTrainingHistoryMeta,
  createTrainingHistoryMeta,
  deriveTrainingHistory,
  isActionableTrainingAction,
  loadTrainingHistoryMeta,
  saveTrainingHistoryMeta,
  updateTrainingHistoryMeta,
  type TrainingHistoryMeta,
} from "@/lib/feed/history";
import { getPlaybookInstruction, type PlatformInstruction } from "@/lib/feed/playbook";

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

export default function ProfilePage() {
  const [preferences, setPreferences] = useState<FeedPreferences>({
    interests: [],
    contentPreferences: [],
    filters: [],
  });
  const [dayIndex, setDayIndex] = useState(0);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress>({
    planKey: "",
    completed: {},
  });
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [historyMeta, setHistoryMeta] = useState<TrainingHistoryMeta>(createTrainingHistoryMeta());
  const [selectedActionForPlaybook, setSelectedActionForPlaybook] = useState<TrainingAction | null>(null);
  const [selectedDiscoveryItem, setSelectedDiscoveryItem] = useState<DiscoveryItem | null>(null);
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const loaded = normalizePreferences(loadPreferences());
      setPreferences(loaded);
      setHasLoadedPreferences(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const blueprint = useMemo(
    () => generateSignalBlueprint(preferences),
    [preferences]
  );

  const plan = useMemo(
    () => generateFeedTrainingPlan(blueprint),
    [blueprint]
  );

  const storageKey = useMemo(() => planStorageKey(plan.days), [plan.days]);

  useEffect(() => {
    if (!hasLoadedPreferences) return;

    const timeout = window.setTimeout(() => {
      setProgress(loadTrainingProgress(storageKey));
      setHistoryMeta(loadTrainingHistoryMeta());
      setHasLoadedHistory(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [hasLoadedPreferences, storageKey]);

  useEffect(() => {
    if (!hasLoadedHistory) return;
    saveTrainingProgress(progress);
  }, [hasLoadedHistory, progress]);

  const history = useMemo(
    () => deriveTrainingHistory(plan, progress.completed, historyMeta),
    [plan, progress.completed, historyMeta]
  );

  const dayProgress = useMemo(
    () => calculateDayProgress(plan.days[dayIndex], progress.completed),
    [plan.days, dayIndex, progress.completed]
  );

  const planProgress = useMemo(
    () => calculatePlanProgress(plan, progress.completed),
    [plan, progress.completed]
  );

  const consistency = useMemo(
    () => calculateConsistency(history),
    [history]
  );

  const topicsReinforced = useMemo(
    () => calculateTopicsReinforced(plan, progress.completed),
    [plan, progress.completed]
  );

  const overallProgress = useMemo(
    () => calculateOverallProgress(history),
    [history]
  );

  const trainingStatus = history.status;

  const currentDay = plan.days[dayIndex] ?? plan.days[0];
  const currentGroupedActions = useMemo(
    () => groupedActions(currentDay),
    [currentDay]
  );

  const discoveryFeed = useMemo(
    () =>
      generatePersonalizedDiscovery({
        blueprint,
        dayIndex,
        completedActions: progress.completed,
        platform: plan.platform,
        plan,
      }),
    [blueprint, dayIndex, progress.completed, plan]
  );

  const toggleAction = (actionId: string) => {
    const newCompleted = {
      ...progress.completed,
      [actionId]: !progress.completed[actionId],
    };
    setProgress({
      planKey: storageKey,
      completed: newCompleted,
    });

    const updatedMeta = updateTrainingHistoryMeta(
      historyMeta,
      plan,
      newCompleted
    );
    setHistoryMeta(updatedMeta);
    saveTrainingHistoryMeta(updatedMeta);
  };

  const handleResetTraining = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setProgress({ planKey: storageKey, completed: {} });
    const cleared = createTrainingHistoryMeta();
    setHistoryMeta(cleared);
    clearTrainingHistoryMeta();
    setDayIndex(0);
    setShowResetConfirm(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(text);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  const modalInstruction: PlatformInstruction | null = useMemo(() => {
    if (!selectedActionForPlaybook) return null;
    return getPlaybookInstruction(selectedActionForPlaybook, plan.platform);
  }, [selectedActionForPlaybook, plan.platform]);

  return (
    <main className="min-h-screen bg-[#070709] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Platform Playbook Modal */}
      <AnimatePresence>
        {selectedActionForPlaybook && modalInstruction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setSelectedActionForPlaybook(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/15 bg-[#121217] p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                  {selectedActionForPlaybook.type} · {plan.platform}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedActionForPlaybook(null)}
                  className="text-sm text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <h3 className="mt-4 text-base font-semibold text-white">
                {modalInstruction.what}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                {modalInstruction.how}
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Recommended Steps (Do)
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-white/80">
                    {modalInstruction.do.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3.5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                    Things to Avoid (Don&apos;t)
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-white/80">
                    {modalInstruction.dont.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedActionForPlaybook(null)}
                  className="rounded-md bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery Detail Modal */}
      <AnimatePresence>
        {selectedDiscoveryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setSelectedDiscoveryItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/15 bg-[#121217] p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                    {selectedDiscoveryItem.type}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    {selectedDiscoveryItem.difficulty}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDiscoveryItem(null)}
                  className="text-sm text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <h3 className="mt-4 text-base font-semibold text-white">
                {selectedDiscoveryItem.title}
              </h3>
              <p className="mt-1 text-xs text-violet-300/80">
                {selectedDiscoveryItem.topicName} {selectedDiscoveryItem.subtopicName ? `· ${selectedDiscoveryItem.subtopicName}` : ""}
              </p>

              {/* Why This Explanation */}
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                  Why This Recommendation?
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/80">
                  {selectedDiscoveryItem.reason}
                </p>
              </div>

              {/* Playbook Guidance if present */}
              {selectedDiscoveryItem.guidance && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      What to Do
                    </h4>
                    <p className="mt-1 text-xs text-white/80">
                      {selectedDiscoveryItem.guidance.how}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Do</div>
                      <ul className="mt-1 space-y-1 text-[11px] text-white/75">
                        {selectedDiscoveryItem.guidance.do.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">Don&apos;t</div>
                      <ul className="mt-1 space-y-1 text-[11px] text-white/75">
                        {selectedDiscoveryItem.guidance.dont.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                {selectedDiscoveryItem.searchQuery ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedDiscoveryItem.searchQuery!)}
                    className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    {copiedQuery === selectedDiscoveryItem.searchQuery ? "✓ Copied Query" : "📋 Copy Search Query"}
                  </button>
                ) : <div />}

                {selectedDiscoveryItem.actionId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDiscoveryItem.actionId) {
                        toggleAction(selectedDiscoveryItem.actionId);
                        setSelectedDiscoveryItem({
                          ...selectedDiscoveryItem,
                          completed: !selectedDiscoveryItem.completed,
                        });
                      }
                    }}
                    className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                      selectedDiscoveryItem.completed
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-violet-600 text-white hover:bg-violet-500"
                    }`}
                  >
                    {selectedDiscoveryItem.completed ? "✓ Marked Complete" : "Mark Complete"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/build"
                className="text-xs uppercase tracking-wider text-white/50 transition hover:text-white"
              >
                ← Back to Blueprint
              </Link>
              <span className="text-white/20">|</span>
              <span className="text-xs uppercase tracking-wider text-violet-400">
                Feed Training Engine
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Signal Blueprint & Discovery Plan
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="rounded-md border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
            >
              Preview Feed →
            </Link>
            <button
              type="button"
              onClick={handleResetTraining}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                showResetConfirm
                  ? "border-rose-500/60 bg-rose-500/20 text-rose-300"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {showResetConfirm ? "Confirm Reset" : "Reset Progress"}
            </button>
          </div>
        </div>

        {/* Top Blueprint Summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                Signal Summary
              </span>
              <span className="text-xs text-white/50">
                Overall Strength: <span className="font-semibold text-white">{blueprint.overallStrength}%</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {blueprint.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {blueprint.primaryInterests.map(interest => (
                <span
                  key={interest.id}
                  className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200"
                >
                  {interest.name} ({interest.strength}%)
                </span>
              ))}
              {blueprint.secondaryInterests.map(interest => (
                <span
                  key={interest.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                >
                  {interest.name} ({interest.strength}%)
                </span>
              ))}
              {blueprint.suppressed.map(filter => (
                <span
                  key={filter}
                  className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-300"
                >
                  Avoid: {filter}
                </span>
              ))}
            </div>
          </div>

          {/* Progress Card */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">
              Training Progress
            </span>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-bold text-white">
                {planProgress.progressPercent}%
              </div>
              <div className="text-xs text-white/50">
                {planProgress.completedCount} of {planProgress.totalActions} actions
              </div>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-violet-500 transition-all duration-300"
                style={{ width: `${planProgress.progressPercent}%` }}
              />
            </div>

            <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
              Status: <span className="font-medium text-white">{trainingStatus.replace(/_/g, " ")}</span>
            </div>
          </div>
        </div>

        {/* 7-Day Day Selector */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {plan.days.map((day, idx) => {
            const isSelected = idx === dayIndex;
            const dayMeta = history.dailyHistory.find((d: DailyHistory) => d.day === day.day);
            const isComplete = dayMeta?.completed;

            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setDayIndex(idx)}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? "border-violet-400 bg-violet-500/10"
                    : isComplete
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white/50">
                    Day {day.day}
                  </span>
                  {isComplete && (
                    <span className="text-xs text-emerald-400">✓</span>
                  )}
                </div>
                <div className="mt-2 text-xs font-semibold text-white">
                  {day.stage}
                </div>
              </button>
            );
          })}
        </div>

        {/* Daily Mission Actions */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Day {currentDay.day} Mission · {currentDay.stage}
              </span>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {currentDay.goal}
              </h2>
            </div>
            <div className="text-xs text-white/50">
              {dayProgress.completedCount} of {dayProgress.totalActions} completed ({dayProgress.progressPercent}%)
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {currentGroupedActions.map(([type, actions]) => (
              <div key={type} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {ACTION_LABELS[type]} ({actions.length})
                </h3>

                <div className="space-y-2.5">
                  {actions.map(action => {
                    const isCompleted = Boolean(progress.completed[action.id]);
                    const detail = actionDetail(action);
                    const isActionable = isActionableTrainingAction(action);

                    return (
                      <div
                        key={action.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 transition ${
                          isCompleted
                            ? "border-emerald-500/25 bg-emerald-500/5 text-white/60"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isActionable && (
                            <button
                              type="button"
                              onClick={() => toggleAction(action.id)}
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                isCompleted
                                  ? "border-emerald-500 bg-emerald-500 text-black"
                                  : "border-white/30 hover:border-white"
                              }`}
                            >
                              {isCompleted && <span className="text-[10px] font-bold">✓</span>}
                            </button>
                          )}
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {action.title}
                            </div>
                            <div className="mt-0.5 text-[11px] text-white/60">
                              {action.description}
                            </div>
                            {detail && (
                              <div className="mt-1 text-[10px] text-violet-300/80">
                                {detail}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedActionForPlaybook(action)}
                            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10 hover:text-white"
                          >
                            Playbook Guide
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Discovery Section */}
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-950/10 to-transparent p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  {discoveryFeed.stageTitle}
                </span>
                <span className="text-xs text-white/40">Personalized Discovery Engine</span>
              </div>
              <h2 className="mt-1.5 text-lg font-semibold text-white">
                {discoveryFeed.stageGoal}
              </h2>
            </div>
            <span className="text-xs text-white/40">
              Stage: <span className="font-semibold uppercase text-violet-300">{discoveryFeed.stage}</span>
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Search Paths */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Curated Search Paths
                </h3>
                <span className="text-[10px] text-violet-300/70">Broad → Specific → Discovery</span>
              </div>

              <div className="space-y-2.5">
                {discoveryFeed.searchPaths.length === 0 ? (
                  <div className="rounded-lg border border-white/5 p-4 text-xs text-white/40">
                    No search queries available for this stage.
                  </div>
                ) : (
                  discoveryFeed.searchPaths.map(item => (
                    <div
                      key={item.id}
                      className="group rounded-lg border border-white/10 bg-black/25 p-3.5 transition hover:border-violet-500/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                            {item.difficulty} · {item.topicName}
                          </span>
                          <div className="mt-0.5 text-xs font-medium text-white">
                            &ldquo;{item.title}&rdquo;
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDiscoveryItem(item)}
                          className="shrink-0 text-[11px] text-violet-300 hover:text-white"
                        >
                          Inspect →
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] leading-relaxed text-white/60">
                        {item.reason}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.searchQuery || item.title)}
                          className="text-[10px] text-white/40 hover:text-white"
                        >
                          {copiedQuery === (item.searchQuery || item.title) ? "✓ Copied" : "📋 Copy Search"}
                        </button>

                        {item.actionId && (
                          <button
                            type="button"
                            onClick={() => toggleAction(item.actionId!)}
                            className={`text-[10px] font-medium ${
                              item.completed ? "text-emerald-400" : "text-white/50 hover:text-white"
                            }`}
                          >
                            {item.completed ? "✓ Completed" : "Mark Done"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Who to Follow / Creators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Who to Follow
                </h3>
                <span className="text-[10px] text-white/40">Reinforces Target Topics</span>
              </div>

              <div className="space-y-2.5">
                {discoveryFeed.curatedCreators.length === 0 ? (
                  <div className="rounded-lg border border-white/5 p-4 text-xs text-white/40">
                    No creators cataloged for current topics.
                  </div>
                ) : (
                  discoveryFeed.curatedCreators.map(item => (
                    <div
                      key={item.id}
                      className="group rounded-lg border border-white/10 bg-black/25 p-3.5 transition hover:border-violet-500/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {item.title}
                          </div>
                          <span className="text-[10px] text-white/40">
                            {item.creator?.platform ?? "Platform"} · {item.creator?.topics.join(", ")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDiscoveryItem(item)}
                          className="shrink-0 text-[11px] text-violet-300 hover:text-white"
                        >
                          Inspect →
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] leading-relaxed text-white/60">
                        {item.reason}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="text-[10px] text-violet-300/80">
                          Aligns with your signals
                        </span>
                        {item.actionId && (
                          <button
                            type="button"
                            onClick={() => toggleAction(item.actionId!)}
                            className={`text-[10px] font-medium ${
                              item.completed ? "text-emerald-400" : "text-white/50 hover:text-white"
                            }`}
                          >
                            {item.completed ? "✓ Followed" : "Mark Followed"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subtopics & Crossover */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Crossover & Subtopic Radar
                </h3>
                <span className="text-[10px] text-violet-300/70">Topic Expansion</span>
              </div>

              <div className="space-y-2.5">
                {discoveryFeed.crossoverSuggestions.map(item => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                        Signal Crossover
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDiscoveryItem(item)}
                        className="text-[11px] text-violet-200 hover:text-white"
                      >
                        Inspect →
                      </button>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white">
                      {item.title}
                    </div>
                    <p className="mt-1 text-[11px] text-white/70">
                      {item.reason}
                    </p>
                  </div>
                ))}

                {discoveryFeed.formatRecommendations.map(item => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-black/25 p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        Format Bias
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDiscoveryItem(item)}
                        className="text-[11px] text-violet-300 hover:text-white"
                      >
                        Inspect →
                      </button>
                    </div>
                    <div className="mt-1 text-xs font-medium text-white">
                      {item.title}
                    </div>
                    <p className="mt-1 text-[11px] text-white/60">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Training History Meta / Consistency */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Training History & Signal Reinforcement
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <span className="text-[11px] text-white/50">Days Completed</span>
              <div className="mt-1 text-2xl font-bold text-white">
                {overallProgress.daysCompleted} / {overallProgress.totalDays}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <span className="text-[11px] text-white/50">Actions Completed</span>
              <div className="mt-1 text-2xl font-bold text-white">
                {overallProgress.actionsCompleted} / {overallProgress.totalActions}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <span className="text-[11px] text-white/50">Consistency Score</span>
              <div className="mt-1 text-2xl font-bold text-white">
                {consistency.percentage}%
              </div>
              <p className="mt-1 text-[10px] text-white/40">{consistency.message}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <span className="text-[11px] text-white/50">Topics Reinforced</span>
              <div className="mt-1 text-2xl font-bold text-white">
                {topicsReinforced.length}
              </div>
            </div>
          </div>

          {topicsReinforced.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="text-[11px] font-semibold text-white/50">Reinforced Topic Activity</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {topicsReinforced.map(tr => (
                  <span
                    key={tr.topic}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75"
                  >
                    {tr.displayName}: <span className="font-semibold text-violet-300">{tr.actionCount} actions</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
