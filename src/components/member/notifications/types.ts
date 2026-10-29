export type NotificationType =
  | "message"
  | "reputation"
  | "follow"
  | "task"
  | "withdrawal"
  | "announcement"
  | "general";

export interface MemberNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  actorName: string;
  sourceId: string;
  createdAt: Date | null;
  readAt: Date | null;
}
