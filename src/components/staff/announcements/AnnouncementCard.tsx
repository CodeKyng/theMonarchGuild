import { CalendarClock, Clock3, Edit3, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GuildAnnouncement } from "./types";

const statusStyle: Record<GuildAnnouncement["status"], string> = { Draft: "bg-amber-500/10 text-amber-800 dark:text-amber-200", Scheduled: "bg-violet-500/10 text-violet-700 dark:text-violet-300", Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", Archived: "bg-muted text-muted-foreground" };
function formatDate(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date) : "No publication date"; }

export default function AnnouncementCard({ announcement, canEdit, onOpen, onEdit }: { announcement: GuildAnnouncement; canEdit: boolean; onOpen: (announcement: GuildAnnouncement) => void; onEdit: (announcement: GuildAnnouncement) => void }) {
  const futureSchedule = announcement.status === "Scheduled" && announcement.publishAt && announcement.publishAt.getTime() > Date.now();
  return <article className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-amber-500/25">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{announcement.category}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[announcement.status]}`}>{announcement.status}</span></div>
    <h3 className="mt-4 line-clamp-2 text-base font-semibold tracking-tight">{announcement.title}</h3><p className="mt-2 line-clamp-4 min-h-20 whitespace-pre-wrap break-words text-sm leading-5 text-muted-foreground">{announcement.body}</p>
    <div className="mt-auto space-y-3 border-t border-border/70 pt-4"><p className="flex items-center gap-1.5 text-xs text-muted-foreground">{futureSchedule ? <Clock3 className="size-3.5" aria-hidden="true" /> : <CalendarClock className="size-3.5" aria-hidden="true" />}{announcement.status === "Scheduled" ? `Scheduled for ${formatDate(announcement.publishAt)}` : announcement.status === "Published" ? `Published ${formatDate(announcement.publishAt ?? announcement.updatedAt)}` : `Updated ${formatDate(announcement.updatedAt ?? announcement.createdAt)}`}</p><div className="flex items-center justify-between gap-2"><button type="button" onClick={() => onOpen(announcement)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Megaphone className="size-3.5" aria-hidden="true" />Preview announcement</button>{canEdit && <Button type="button" variant="outline" size="sm" onClick={() => onEdit(announcement)}><Edit3 className="size-3.5" aria-hidden="true" />Edit</Button>}</div></div>
  </article>;
}
