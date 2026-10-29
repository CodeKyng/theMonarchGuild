import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export const notificationTypes = [
  "message",
  "reputation",
  "follow",
  "task",
  "withdrawal",
  "general",
] as const;

export type AppNotificationType = (typeof notificationTypes)[number];

export interface CreateNotificationInput {
  userId: string;
  type: AppNotificationType;
  title: string;
  body: string;
  href?: string;
  actorName?: string;
  sourceId?: string;
}

/** Write a notification into users/{userId}/notifications. Safe to fire-and-forget. */
export async function createNotification(db: Firestore, input: CreateNotificationInput) {
  if (!input.userId) return;
  await addDoc(collection(db, "users", input.userId, "notifications"), {
    type: input.type,
    title: input.title.trim() || "Guild update",
    body: input.body.trim(),
    href: input.href?.trim() || "",
    actorName: input.actorName?.trim() || "",
    sourceId: input.sourceId?.trim() || "",
    createdAt: serverTimestamp(),
    readAt: null,
  });
}
