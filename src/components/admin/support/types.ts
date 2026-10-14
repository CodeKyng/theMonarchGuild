export const supportStatuses = ["Open", "In progress", "Waiting on member", "Resolved"] as const;
export const supportPriorities = ["Low", "Normal", "High", "Urgent"] as const;

export type SupportStatus = (typeof supportStatuses)[number];
export type SupportPriority = (typeof supportPriorities)[number];

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  memberName: string;
  memberEmail: string;
  assignedTo: string;
  priority: SupportPriority;
  status: SupportStatus;
  adminReply: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
