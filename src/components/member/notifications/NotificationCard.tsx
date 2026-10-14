import { Award, Bell, Check, MessageCircle } from "lucide-react";
import type { MemberNotification } from "@/components/member/notifications/types";

function formatDate(date: Date | null) {
  if (!date) return "Just now";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" }).format(date);
}

export default function NotificationCard({ notification, onOpen, onMarkRead }: { notification: MemberNotification; onOpen: (notification: MemberNotification) => void; onMarkRead: (notification: MemberNotification) => void }) {
  const Icon = notification.type === "message" ? MessageCircle : notification.type === "reputation" ? Award : Bell;
  return <article className={`group flex min-w-0 gap-3 rounded-2xl border p-4 transition-colors sm:gap-4 sm:p-5 ${notification.readAt ? "border-border/70 bg-card" : "border-primary/20 bg-primary/[0.035]"}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${notification.type === "reputation" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-primary/10 text-primary"}`}><Icon className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-semibold">{notification.title}</h3>{!notification.readAt && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}<time className="ml-auto text-xs text-muted-foreground">{formatDate(notification.createdAt)}</time></div><p className="mt-1 break-words text-sm leading-5 text-muted-foreground">{notification.body}</p>{notification.actorName && <p className="mt-2 text-xs text-muted-foreground">From {notification.actorName}</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onOpen(notification)} className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70">Open</button>{!notification.readAt && <button type="button" onClick={() => onMarkRead(notification)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"><Check className="size-3.5" aria-hidden="true" />Mark read</button>}</div></div></article>;
}
