export const reportStatuses = ["New", "Under review", "Resolved", "Dismissed"] as const;
export const reportSeverities = ["Low", "Medium", "High", "Urgent"] as const;

export type ReportStatus = (typeof reportStatuses)[number];
export type ReportSeverity = (typeof reportSeverities)[number];

export interface ModerationReport {
  id: string;
  subject: string;
  details: string;
  category: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserName: string;
  reportedUserId: string;
  severity: ReportSeverity;
  status: ReportStatus;
  moderationNotes: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
