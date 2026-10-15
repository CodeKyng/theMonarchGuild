import { CheckCircle2, CircleDashed, Clock3, ListTodo } from "lucide-react";
import type { StaffTask } from "./types";

export default function TaskSummary({ tasks, loading }: { tasks: StaffTask[]; loading: boolean }) {
  const counts = [
    { label: "Total tasks", value: tasks.length, icon: ListTodo, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "To do", value: tasks.filter((task) => task.status === "Assigned").length, icon: CircleDashed, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "In progress", value: tasks.filter((task) => task.status === "In progress").length, icon: Clock3, color: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
    { label: "Completed", value: tasks.filter((task) => task.status === "Completed").length, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  ];
  return <section aria-label="Task totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{counts.map(({ label, value, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p></div></article>)}</section>;
}
