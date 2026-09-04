"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { generateSignalBlueprint } from "@/lib/feed/blueprint";
import { loadPreferences } from "@/lib/feed/preferences";
import { generateFeedTrainingPlan } from "@/lib/feed/training";
import {
  FeedPreferences,
  FeedTrainingDay,
  TrainingAction,
  TrainingActionType,
} from "@/lib/feed/types";

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
    if (parsed.planKey !== planKey || !parsed.completed) {
      return { planKey, completed: {} };
    }

    return {
      planKey,
      completed: parsed.completed,
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = loadPreferences();
      setPrefs({
        interests: stored.interests ?? [],
        contentPreferences: stored.contentPreferences ?? [],
        filters: stored.filters ?? [],
      });
      setHasLoadedPreferences(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const blueprint = useMemo(() => generateSignalBlueprint(prefs), [prefs]);
  const plan = useMemo(() => generateFeedTrainingPlan(blueprint), [blueprint]);
  const storageKey = useMemo(() => planStorageKey(plan.days), [plan.days]);
  const currentDay = plan.days[dayIndex];
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
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [hasLoadedPreferences, storageKey]);

  useEffect(() => {
    if (!progress.planKey) return;
    saveTrainingProgress(progress);
  }, [progress]);

  const completedCount = currentDay.actions.filter(
    action => progress.completed[action.id]
  ).length;
  const totalActions = currentDay.actions.length;
  const progressPercent = totalActions
    ? Math.round((completedCount / totalActions) * 100)
    : 0;

  const toggleAction = (actionId: string) => {
    setProgress(current => ({
      planKey: storageKey,
      completed: {
        ...current.completed,
        [actionId]: !current.completed[actionId],
      },
    }));
  };

  if (!hasLoadedPreferences) {
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(168,85,247,0.22),transparent_34%),radial-gradient(circle_at_78%_14%,rgba(45,212,191,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/40">
                FeedSmith
              </p>
              <h1 className="mt-4 text-4xl font-medium leading-tight md:text-6xl">
                Your Feed Training Plan
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
                Based on the feed you told us you want. FeedSmith does not
                control the recommendation system; it gives you a daily mission
                so you can shape your own signal intentionally.
              </p>
            </div>
            <Link
              href="/build"
              className="w-fit rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/65 transition hover:border-white/35 hover:text-white"
            >
              Edit signal
            </Link>
          </header>

          <section className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md">
              <h2 className="text-xs font-medium uppercase tracking-[0.26em] text-white/38">
                Your signal
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  {sortedInterests.map(interest => (
                    <div
                      key={interest.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-4"
                    >
                      <span className="text-sm text-white/74">
                        {interest.name}
                      </span>
                      <span className="text-sm tabular-nums text-white">
                        {interest.strength}
                      </span>
                      <span className="col-span-2 h-1.5 rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-violet-300"
                          style={{ width: `${interest.strength}%` }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {sortedContentPreferences.slice(0, 4).map(preference => (
                    <div
                      key={preference.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-4"
                    >
                      <span className="text-sm text-white/74">
                        {preference.name}
                      </span>
                      <span className="text-sm tabular-nums text-white">
                        {preference.strength}
                      </span>
                      <span className="col-span-2 h-1.5 rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-teal-200"
                          style={{ width: `${preference.strength}%` }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/25 p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.26em] text-white/38">
                Plan progress
              </h2>
              <p className="mt-5 text-3xl font-medium">
                {completedCount} / {totalActions}
              </p>
              <p className="mt-1 text-sm text-white/45">
                actions complete for day {currentDay.day} of 7
              </p>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-black/35 p-5 shadow-2xl shadow-violet-950/30 backdrop-blur-md md:p-7">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-200/70">
                  Today&apos;s mission
                </p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDay.day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="mt-3 text-3xl font-medium md:text-5xl">
                      Day {currentDay.day} — {currentDay.stage}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/56">
                      <span className="text-white/80">Your goal:</span>{" "}
                      {currentDay.goal}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={dayIndex === 0}
                  onClick={() => setDayIndex(current => Math.max(0, current - 1))}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ← Previous
                </button>
                <span className="min-w-24 text-center text-xs font-medium uppercase tracking-[0.18em] text-white/38">
                  Day {currentDay.day} of 7
                </span>
                <button
                  type="button"
                  disabled={dayIndex === plan.days.length - 1}
                  onClick={() =>
                    setDayIndex(current =>
                      Math.min(plan.days.length - 1, current + 1)
                    )
                  }
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next →
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentDay.day}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="mt-7 grid gap-7"
              >
                {groupedActions(currentDay).map(([type, actions]) => (
                  <section key={type}>
                    <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-white/36">
                      {ACTION_LABELS[type]}
                    </h3>
                    <div className="grid gap-2">
                      {actions.map(action => {
                        const complete = Boolean(progress.completed[action.id]);
                        const detail = actionDetail(action);

                        return (
                          <label
                            key={action.id}
                            className={`group grid cursor-pointer grid-cols-[auto_1fr] gap-4 rounded-md border p-4 transition ${
                              complete
                                ? "border-teal-200/30 bg-teal-200/[0.06]"
                                : "border-white/10 bg-white/[0.025] hover:border-white/22 hover:bg-white/[0.045]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={complete}
                              onChange={() => toggleAction(action.id)}
                              className="mt-1 h-4 w-4 accent-teal-200"
                            />
                            <span>
                              <span
                                className={`block text-sm font-medium ${
                                  complete ? "text-white/48 line-through" : "text-white"
                                }`}
                              >
                                {action.title}
                              </span>
                              <span className="mt-1 block text-sm leading-6 text-white/55">
                                {action.description}
                              </span>
                              <span className="mt-2 block text-xs leading-5 text-white/35">
                                {detail ? `${detail}. ` : ""}
                                {action.why}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
              7-day plan
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
              {plan.days.map((day, index) => (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setDayIndex(index)}
                  className={`rounded-md border p-4 text-left transition ${
                    index === dayIndex
                      ? "border-violet-200/60 bg-violet-300/[0.12]"
                      : "border-white/10 bg-white/[0.025] hover:border-white/25"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    Day {day.day}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-white">
                    {day.stage}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
