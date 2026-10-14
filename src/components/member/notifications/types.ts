export type NotificationType = "message" | "reputation" | "general";
export interface MemberNotification { id: string; type: NotificationType; title: string; body: string; href: string; actorName: string; sourceId: string; createdAt: Date | null; readAt: Date | null; }
