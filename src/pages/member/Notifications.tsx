import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import NotificationFilters from "@/components/member/notifications/NotificationFilters";
import NotificationsFeed from "@/components/member/notifications/NotificationsFeed";
import NotificationsHeader from "@/components/member/notifications/NotificationsHeader";
import type { MemberNotification, NotificationType } from "@/components/member/notifications/types";
import { db } from "@/firebase";

const knownTypes: NotificationType[] = [
  "message",
  "reputation",
  "follow",
  "task",
  "withdrawal",
  "general",
];

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function notificationFromDoc(id: string, data: Record<string, unknown>): MemberNotification {
  const rawType = asText(data.type);
  const type: NotificationType = knownTypes.includes(rawType as NotificationType)
    ? (rawType as NotificationType)
    : "general";
  return {
    id,
    type,
    title: asText(data.title) || "Guild update",
    body: asText(data.body),
    href: asText(data.href),
    actorName: asText(data.actorName),
    sourceId: asText(data.sourceId),
    createdAt: asDate(data.createdAt),
    readAt: asDate(data.readAt),
  };
}

export default function MemberNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "users", user.uid, "notifications"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setNotifications(snapshot.docs.map((entry) => notificationFromDoc(entry.id, entry.data())));
        setLoading(false);
        setError("");
      },
      (loadError) => {
        console.error("Failed to load member notifications:", loadError);
        setError("Your notifications could not be loaded. Check your connection and try again.");
        setLoading(false);
      },
    );
  }, [user, retryToken]);

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (filter === "unread") return !notification.readAt;
        return filter === "all" || notification.type === filter;
      }),
    [filter, notifications],
  );

  async function markRead(notification: MemberNotification) {
    if (!user || notification.readAt) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", notification.id), {
        readAt: serverTimestamp(),
      });
    } catch (markError) {
      console.error("Failed to mark notification as read:", markError);
      setError("This notification could not be marked as read. Try again.");
    }
  }

  async function markAllRead() {
    if (!user || !unreadCount || markingAllRead) return;
    setMarkingAllRead(true);
    setError("");
    try {
      const unread = notifications.filter((notification) => !notification.readAt);
      for (let index = 0; index < unread.length; index += 450) {
        const batch = writeBatch(db);
        unread.slice(index, index + 450).forEach((notification) =>
          batch.update(doc(db, "users", user.uid, "notifications", notification.id), {
            readAt: serverTimestamp(),
          }),
        );
        await batch.commit();
      }
    } catch (markError) {
      console.error("Failed to mark all notifications as read:", markError);
      setError("Some notifications could not be marked as read. Try again.");
    } finally {
      setMarkingAllRead(false);
    }
  }

  async function openNotification(notification: MemberNotification) {
    await markRead(notification);
    if (notification.type === "message" && notification.sourceId) {
      navigate(`/member/messages?conversation=${encodeURIComponent(notification.sourceId)}`);
      return;
    }
    if (notification.type === "reputation") {
      navigate("/member/leaderboard");
      return;
    }
    if (notification.type === "task" || notification.type === "withdrawal") {
      navigate(notification.href || "/member/tasks");
      return;
    }
    if (notification.type === "follow") {
      navigate(notification.href || "/member/explore-members");
      return;
    }
    const href = notification.href;
    if (href.startsWith("/") && !href.startsWith("//")) navigate(href);
  }

  function retry() {
    setLoading(true);
    setError("");
    setRetryToken((value) => value + 1);
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl space-y-6">
      <NotificationsHeader
        unreadCount={unreadCount}
        markingAllRead={markingAllRead}
        onMarkAllRead={() => void markAllRead()}
      />
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm leading-5 text-destructive">{error}</p>
          </div>
          <button type="button" onClick={retry} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary">
            <RefreshCw className="size-4" aria-hidden="true" />
            Reconnect
          </button>
        </div>
      )}
      <NotificationFilters filter={filter} onFilter={setFilter} />
      <NotificationsFeed
        notifications={visibleNotifications}
        loading={loading}
        filtered={filter !== "all"}
        onOpen={(notification) => void openNotification(notification)}
        onMarkRead={(notification) => void markRead(notification)}
      />
    </main>
  );
}
