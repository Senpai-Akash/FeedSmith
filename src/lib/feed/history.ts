import type {
  FeedTrainingDay,
  FeedTrainingPlan,
  TrainingAction,
} from "./types";

export type TrainingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "DAY_COMPLETE"
  | "TRAINING_COMPLETE";

export interface DailyHistory {
  day: number;
  stage: FeedTrainingDay["stage"];
  completed: boolean;
  completedActions: number;
  totalActions: number;
  completedAt?: string;
}

export interface TrainingHistory {
  startedAt?: string;
  currentDay: number;
  completedDays: number;
  totalActions: number;
  completedActions: number;
  dailyHistory: DailyHistory[];
  status: TrainingStatus;
}

interface DailyHistoryMeta {
  day: number;
  startedAt?: string;
  completedAt?: string;
}

export interface TrainingHistoryMeta {
  version: 1;
  startedAt?: string;
  updatedAt?: string;
  days: DailyHistoryMeta[];
}

export interface ConsistencyMetric {
  completedPlannedDays: number;
  elapsedTrainingDays: number;
  percentage: number;
  message: string;
}

export interface TopicReinforcement {
  topic: string;
  displayName: string;
  actionCount: number;
}

export interface OverallProgress {
  daysCompleted: number;
  totalDays: number;
  daysPercentage: number;
  actionsCompleted: number;
  totalActions: number;
  actionsPercentage: number;
}

export const TRAINING_HISTORY_STORAGE_KEY = "feedTrainingHistory:v1";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function isActionableTrainingAction(action: TrainingAction): boolean {
  return action.type !== "ENGAGE";
}

export function createTrainingHistoryMeta(): TrainingHistoryMeta {
  return {
    version: 1,
    days: [],
  };
}

export function loadTrainingHistoryMeta(): TrainingHistoryMeta {
  if (typeof window === "undefined") {
    return createTrainingHistoryMeta();
  }

  try {
    const raw = localStorage.getItem(TRAINING_HISTORY_STORAGE_KEY);
    if (!raw) return createTrainingHistoryMeta();

    const parsed = JSON.parse(raw) as unknown;
    if (!isTrainingHistoryMeta(parsed)) {
      return createTrainingHistoryMeta();
    }

    return parsed;
  } catch {
    return createTrainingHistoryMeta();
  }
}

export function saveTrainingHistoryMeta(meta: TrainingHistoryMeta): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TRAINING_HISTORY_STORAGE_KEY, JSON.stringify(meta));
  } catch (error) {
    console.error("Failed to save training history", error);
  }
}

export function clearTrainingHistoryMeta(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TRAINING_HISTORY_STORAGE_KEY);
}

export function updateTrainingHistoryMeta(
  currentMeta: TrainingHistoryMeta,
  plan: FeedTrainingPlan,
  completed: Record<string, boolean>,
  now: Date = new Date()
): TrainingHistoryMeta {
  const timestamp = now.toISOString();
  const existingDays = new Map(currentMeta.days.map(day => [day.day, day]));
  const startedDayNumbers = new Set<number>();

  for (const day of plan.days) {
    const actionable = getActionableActions(day);
    const completedActions = actionable.filter(action => completed[action.id]);

    if (completedActions.length > 0) {
      startedDayNumbers.add(day.day);
    }
  }

  const nextDays = plan.days.flatMap(day => {
    const existing = existingDays.get(day.day);
    const actionable = getActionableActions(day);
    const totalActions = actionable.length;
    const completedActions = actionable.filter(action => completed[action.id]).length;
    const hasStarted = startedDayNumbers.has(day.day) || Boolean(existing?.startedAt);

    if (!hasStarted) return [];

    const completedAt =
      totalActions > 0 && completedActions === totalActions
        ? existing?.completedAt ?? timestamp
        : undefined;

    return [
      {
        day: day.day,
        startedAt: existing?.startedAt ?? timestamp,
        completedAt,
      },
    ];
  });

  return {
    version: 1,
    startedAt: currentMeta.startedAt ?? (nextDays.length > 0 ? timestamp : undefined),
    updatedAt: timestamp,
    days: nextDays,
  };
}

export function deriveTrainingHistory(
  plan: FeedTrainingPlan,
  completed: Record<string, boolean>,
  meta: TrainingHistoryMeta
): TrainingHistory {
  const completedDays = plan.days.filter(day => isDayComplete(day, completed)).length;
  const totalActions = plan.days.reduce(
    (sum, day) => sum + getActionableActions(day).length,
    0
  );
  const completedActions = plan.days.reduce(
    (sum, day) =>
      sum + getActionableActions(day).filter(action => completed[action.id]).length,
    0
  );
  const currentDay = getCurrentTrainingDay(plan, completed);
  const status = getTrainingStatus(plan, completed);

  return {
    startedAt: meta.startedAt,
    currentDay,
    completedDays,
    totalActions,
    completedActions,
    dailyHistory: plan.days.map(day => buildDailyHistory(day, completed, meta)),
    status,
  };
}

export function calculateOverallProgress(history: TrainingHistory): OverallProgress {
  return {
    daysCompleted: history.completedDays,
    totalDays: history.dailyHistory.length,
    daysPercentage:
      history.dailyHistory.length > 0
        ? Math.round((history.completedDays / history.dailyHistory.length) * 100)
        : 0,
    actionsCompleted: history.completedActions,
    totalActions: history.totalActions,
    actionsPercentage:
      history.totalActions > 0
        ? Math.round((history.completedActions / history.totalActions) * 100)
        : 0,
  };
}

export function calculateConsistency(
  history: TrainingHistory,
  now: Date = new Date()
): ConsistencyMetric {
  if (!history.startedAt) {
    return {
      completedPlannedDays: 0,
      elapsedTrainingDays: 0,
      percentage: 0,
      message: "Start Day 1 to begin tracking your consistency.",
    };
  }

  const startedAtMs = Date.parse(history.startedAt);
  const elapsedTrainingDays = Number.isFinite(startedAtMs)
    ? Math.min(
        history.dailyHistory.length,
        Math.max(1, Math.ceil((now.getTime() - startedAtMs) / DAY_IN_MS))
      )
    : 1;
  const plannedDays = Math.max(
    elapsedTrainingDays,
    history.dailyHistory.filter(day => day.completedActions > 0 || day.completed).length
  );
  const completedPlannedDays = history.dailyHistory
    .filter(day => day.day <= plannedDays)
    .filter(day => day.completed).length;
  const percentage =
    plannedDays > 0 ? Math.round((completedPlannedDays / plannedDays) * 100) : 0;

  return {
    completedPlannedDays,
    elapsedTrainingDays: plannedDays,
    percentage,
    message: `${completedPlannedDays} of the last ${plannedDays} planned days completed.`,
  };
}

export function calculateTopicsReinforced(
  plan: FeedTrainingPlan,
  completed: Record<string, boolean>
): TopicReinforcement[] {
  const topics = new Map<string, TopicReinforcement>();

  for (const action of plan.days.flatMap(day => getActionableActions(day))) {
    if (!completed[action.id] || !("topic" in action) || !action.topic) continue;

    const current = topics.get(action.topic);
    topics.set(action.topic, {
      topic: action.topic,
      displayName: "topicName" in action && action.topicName ? action.topicName : action.topic,
      actionCount: (current?.actionCount ?? 0) + 1,
    });
  }

  return [...topics.values()].sort(
    (a, b) => b.actionCount - a.actionCount || a.displayName.localeCompare(b.displayName)
  );
}

export function getDayProgressPercent(day: DailyHistory): number {
  return day.totalActions > 0
    ? Math.round((day.completedActions / day.totalActions) * 100)
    : 0;
}

function buildDailyHistory(
  day: FeedTrainingDay,
  completed: Record<string, boolean>,
  meta: TrainingHistoryMeta
): DailyHistory {
  const dayMeta = meta.days.find(item => item.day === day.day);
  const actionable = getActionableActions(day);
  const completedActions = actionable.filter(action => completed[action.id]).length;
  const totalActions = actionable.length;
  const completedAt =
    totalActions > 0 && completedActions === totalActions
      ? dayMeta?.completedAt
      : undefined;

  return {
    day: day.day,
    stage: day.stage,
    completed: Boolean(completedAt),
    completedActions,
    totalActions,
    completedAt,
  };
}

function getCurrentTrainingDay(
  plan: FeedTrainingPlan,
  completed: Record<string, boolean>
): number {
  const firstIncomplete = plan.days.find(day => !isDayComplete(day, completed));
  return firstIncomplete?.day ?? plan.days.length;
}

function getTrainingStatus(
  plan: FeedTrainingPlan,
  completed: Record<string, boolean>
): TrainingStatus {
  const hasStarted = plan.days.some(day =>
    getActionableActions(day).some(action => completed[action.id])
  );

  if (!hasStarted) return "NOT_STARTED";
  if (plan.days.every(day => isDayComplete(day, completed))) return "TRAINING_COMPLETE";

  const currentDay = plan.days.find(day => !isDayComplete(day, completed));
  if (currentDay && getActionableActions(currentDay).some(action => completed[action.id])) {
    return "IN_PROGRESS";
  }

  return "DAY_COMPLETE";
}

function isDayComplete(
  day: FeedTrainingDay,
  completed: Record<string, boolean>
): boolean {
  const actionable = getActionableActions(day);
  return actionable.length > 0 && actionable.every(action => completed[action.id]);
}

function getActionableActions(day: FeedTrainingDay): TrainingAction[] {
  return day.actions.filter(isActionableTrainingAction);
}

function isTrainingHistoryMeta(value: unknown): value is TrainingHistoryMeta {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<TrainingHistoryMeta>;
  if (candidate.version !== 1) return false;
  if (candidate.startedAt !== undefined && typeof candidate.startedAt !== "string") return false;
  if (candidate.updatedAt !== undefined && typeof candidate.updatedAt !== "string") return false;
  if (!Array.isArray(candidate.days)) return false;

  return candidate.days.every(day => {
    if (!day || typeof day !== "object") return false;
    const dayCandidate = day as Partial<DailyHistoryMeta>;
    return (
      typeof dayCandidate.day === "number" &&
      (dayCandidate.startedAt === undefined ||
        typeof dayCandidate.startedAt === "string") &&
      (dayCandidate.completedAt === undefined ||
        typeof dayCandidate.completedAt === "string")
    );
  });
}
