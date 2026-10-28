export const taskPlatforms = ["X", "Telegram", "Other"] as const;
export const taskStatuses = ["Active", "Paused", "Closed"] as const;
export const submissionStatuses = ["Pending", "Approved", "Rejected", "Rewarded"] as const;

export type TaskPlatform = (typeof taskPlatforms)[number];
export type TaskStatus = (typeof taskStatuses)[number];
export type SubmissionStatus = (typeof submissionStatuses)[number];

export interface CommunityTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  platform: TaskPlatform;
  actionUrl: string;
  rewardAmount: number;
  status: TaskStatus;
  createdBy: string;
  createdByName: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  maxCompletions: number | null;
  completionCount: number;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  walletAddress: string;
  proofUrl: string;
  proofNote: string;
  status: SubmissionStatus;
  rewardAmount: number;
  reviewedBy: string | null;
  reviewedByName: string | null;
  reviewedAt: Date | null;
  reviewNote: string;
  rewardTxHash: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

export function taskFromDocument(id: string, data: Record<string, unknown>): CommunityTask {
  const platformRaw = stringValue(data.platform);
  const statusRaw = stringValue(data.status);
  return {
    id,
    title: stringValue(data.title) || "Untitled task",
    description: stringValue(data.description),
    instructions: stringValue(data.instructions),
    platform: taskPlatforms.find((p) => p.toLowerCase() === platformRaw.toLowerCase()) ?? "Other",
    actionUrl: stringValue(data.actionUrl),
    rewardAmount: numberValue(data.rewardAmount),
    status: taskStatuses.find((s) => s.toLowerCase() === statusRaw.toLowerCase()) ?? "Active",
    createdBy: stringValue(data.createdBy),
    createdByName: stringValue(data.createdByName),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    maxCompletions: data.maxCompletions == null ? null : numberValue(data.maxCompletions, 0) || null,
    completionCount: numberValue(data.completionCount),
  };
}

export function submissionFromDocument(id: string, data: Record<string, unknown>): TaskSubmission {
  const statusRaw = stringValue(data.status);
  return {
    id,
    taskId: stringValue(data.taskId),
    taskTitle: stringValue(data.taskTitle),
    userId: stringValue(data.userId),
    userName: stringValue(data.userName),
    walletAddress: stringValue(data.walletAddress),
    proofUrl: stringValue(data.proofUrl),
    proofNote: stringValue(data.proofNote),
    status: submissionStatuses.find((s) => s.toLowerCase() === statusRaw.toLowerCase()) ?? "Pending",
    rewardAmount: numberValue(data.rewardAmount),
    reviewedBy: stringValue(data.reviewedBy) || null,
    reviewedByName: stringValue(data.reviewedByName) || null,
    reviewedAt: toDate(data.reviewedAt),
    reviewNote: stringValue(data.reviewNote),
    rewardTxHash: stringValue(data.rewardTxHash) || null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}
