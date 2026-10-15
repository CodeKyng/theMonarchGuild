import { CalendarClock, ChevronRight, CircleCheck, Clock3, Flag } from "lucide-react";
import type { StaffTask } from "./types";

const priorityStyle: Record<StaffTask["priority"], string> = {
  Urgent: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  High: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Normal: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Low: "bg-muted text-muted-foreground",
};
const statusStyle: Record<StaffTask["status"], string> = {
  Assigned: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  "In progress": "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

function dueLabel(date: Date | null) {
  if (!date) return "No due date";
  const day = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  return `Due ${day}`;
}

export default function TaskCard({ task, onOpen }: { task: StaffTask; onOpen: (task: StaffTask) => void }) {
  const overdue = task.dueAt && task.dueAt.getTime() < Date.now() && task.status !== "Completed";
  const StatusIcon = task.status === "Completed" ? CircleCheck : task.status === "In progress" ? Clock3 : Flag;
  return <button type="button" onClick={() => onOpen(task)} className="group flex h-full w-full flex-col rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityStyle[task.priority]}`}>{task.priority} priority</span>{task.category && <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{task.category}</span>}</div><ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></div>
    <h3 className="mt-4 line-clamp-2 text-base font-semibold tracking-tight">{task.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{task.description || "No task details provided."}</p>
    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[task.status]}`}><StatusIcon className="size-3.5" aria-hidden="true" />{task.status}</span><span className={`inline-flex items-center gap-1.5 text-xs ${overdue ? "font-semibold text-destructive" : "text-muted-foreground"}`}><CalendarClock className="size-3.5" aria-hidden="true" />{overdue ? "Overdue" : dueLabel(task.dueAt)}</span></div>
  </button>;
}
