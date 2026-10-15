import { ArrowUpRight, CalendarClock, CheckCheck, CircleDashed, MessageCircleWarning } from "lucide-react";
import type { ReviewablePost } from "./types";

const statusStyle: Record<ReviewablePost["reviewStatus"], string> = { "Needs review": "bg-amber-500/10 text-amber-800 dark:text-amber-200", Reviewed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", "Follow-up needed": "bg-rose-500/10 text-rose-700 dark:text-rose-300" };
function formatDate(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date) : "Recently posted"; }

export default function ContentReviewCard({ post, onOpen }: { post: ReviewablePost; onOpen: (post: ReviewablePost) => void }) {
  const Icon = post.reviewStatus === "Reviewed" ? CheckCheck : post.reviewStatus === "Follow-up needed" ? MessageCircleWarning : CircleDashed;
  const initials = post.authorName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "M";
  return <button type="button" onClick={() => onOpen(post)} className="group flex h-full w-full flex-col rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">{post.category}</span><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[post.reviewStatus]}`}><Icon className="size-3.5" aria-hidden="true" />{post.reviewStatus}</span></div>
    <p className="mt-4 line-clamp-4 min-h-20 whitespace-pre-wrap break-words text-sm leading-5">{post.body}</p>
    {post.moderationNotes && <p className="mt-3 line-clamp-2 rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">Latest note: {post.moderationNotes}</p>}
    <div className="mt-auto flex items-center gap-3 border-t border-border/70 pt-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{post.authorName}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3" aria-hidden="true" />{formatDate(post.createdAt)}</p></div><ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div>
  </button>;
}
