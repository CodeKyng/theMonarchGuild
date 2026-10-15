import { CheckCheck, ClipboardList, MessageCircleWarning } from "lucide-react";
import type { ReviewablePost } from "./types";

export default function ContentReviewSummary({ posts, loading }: { posts: ReviewablePost[]; loading: boolean }) {
  const counts = [
    { label: "Total posts", value: posts.length, note: "Community content", icon: ClipboardList, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "Needs review", value: posts.filter((post) => post.reviewStatus === "Needs review").length, note: "Not reviewed yet", icon: ClipboardList, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "Follow-up needed", value: posts.filter((post) => post.reviewStatus === "Follow-up needed").length, note: "Requires another look", icon: MessageCircleWarning, color: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
    { label: "Reviewed", value: posts.filter((post) => post.reviewStatus === "Reviewed").length, note: "Review recorded", icon: CheckCheck, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  ];
  return <section aria-label="Content review summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{counts.map(({ label, value, note, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p><p className="text-xs text-muted-foreground">{note}</p></div></article>)}</section>;
}
