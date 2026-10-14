import { Bell, SearchX } from "lucide-react";
import type { MemberNotification } from "@/components/member/notifications/types";
import NotificationCard from "@/components/member/notifications/NotificationCard";

export default function NotificationsFeed({ notifications, loading, filtered, onOpen, onMarkRead }: { notifications: MemberNotification[]; loading: boolean; filtered: boolean; onOpen: (notification: MemberNotification) => void; onMarkRead: (notification: MemberNotification) => void }) {
  if (loading && !notifications.length) return <div className="space-y-3" role="status" aria-label="Loading notifications">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted" />)}</div>;
  if (!notifications.length) return <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">{filtered ? <SearchX className="size-5" aria-hidden="true" /> : <Bell className="size-5" aria-hidden="true" />}</span><h3 className="mt-4 font-semibold">{filtered ? "No notifications in this view" : "You’re all caught up"}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{filtered ? "Choose another filter to see more activity." : "New messages and Guild recognition will appear here."}</p></div>;
  return <div className="space-y-3" aria-live="polite">{notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} onOpen={onOpen} onMarkRead={onMarkRead} />)}</div>;
}
