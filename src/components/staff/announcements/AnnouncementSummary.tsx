import { CalendarClock, FilePenLine, Megaphone } from "lucide-react";
import type { GuildAnnouncement } from "./types";

export default function AnnouncementSummary({ announcements, loading }: { announcements: GuildAnnouncement[]; loading: boolean }) {
  const now = Date.now();
  const metrics = [
    { label: "All announcements", value: announcements.length, note: "Across all statuses", icon: Megaphone, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "Published", value: announcements.filter((item) => item.status === "Published" && (!item.publishAt || item.publishAt.getTime() <= now)).length, note: "Marked as published", icon: Megaphone, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
    { label: "Drafts", value: announcements.filter((item) => item.status === "Draft").length, note: "Saved for later", icon: FilePenLine, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "Scheduled", value: announcements.filter((item) => item.status === "Scheduled").length, note: "Queued for publication", icon: CalendarClock, color: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  ];
  return <section aria-label="Announcement overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, note, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p><p className="text-xs text-muted-foreground">{note}</p></div></article>)}</section>;
}
