import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export const notificationTypes = [
  "message",
  "reputation",
  "follow",
  "task",
  "withdrawal",
  "announcement",
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

/** Role-neutral path for message deep-links; each workspace maps the first segment. */
export function messageNotificationHref(conversationId: string) {
  return `/member/messages?conversation=${encodeURIComponent(conversationId)}`;
}

/** Write a notification into users/{userId}/notifications. */
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

/** Batch-notify many users (chunks of 400). Skips empty ids. */
export async function createNotificationsForUsers(
  db: Firestore,
  userIds: string[],
  payload: Omit<CreateNotificationInput, "userId">,
) {
  const unique = [...new Set(userIds.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 400) {
    const batch = writeBatch(db);
    const slice = unique.slice(i, i + 400);
    for (const userId of slice) {
      const ref = doc(collection(db, "users", userId, "notifications"));
      batch.set(ref, {
        type: payload.type,
        title: payload.title.trim() || "Guild update",
        body: payload.body.trim(),
        href: payload.href?.trim() || "",
        actorName: payload.actorName?.trim() || "",
        sourceId: payload.sourceId?.trim() || "",
        createdAt: serverTimestamp(),
        readAt: null,
      });
    }
    await batch.commit();
  }
}

/** Notify every signed-up member (role === member). Staff/admin need read access on users. */
export async function notifyAllMembers(
  db: Firestore,
  payload: Omit<CreateNotificationInput, "userId">,
) {
  const snap = await getDocs(query(collection(db, "users"), where("role", "==", "member")));
  await createNotificationsForUsers(
    db,
    snap.docs.map((d) => d.id),
    payload,
  );
}
