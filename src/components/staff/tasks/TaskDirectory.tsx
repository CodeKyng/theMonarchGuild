import { ClipboardList, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";
import type { StaffTask } from "./types";

export default function TaskDirectory({ tasks, allTasks, loading, search, status, priority, onSearch, onStatus, onPriority, onReset, onOpen }: {
  tasks: StaffTask[]; allTasks: StaffTask[]; loading: boolean; search: string; status: string; priority: string;
  onSearch: (value: string) => void; onStatus: (value: string) => void; onPriority: (value: string) => void; onReset: () => void; onOpen: (task: StaffTask) => void;
}) {
  return <Card className="border-border/70 shadow-sm"><CardContent className="space-y-5 p-4 sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-semibold">Task board</h2><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading your assigned work…" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} shown`}</p></div></div>
    <TaskFilters search={search} status={status} priority={priority} onSearch={onSearch} onStatus={onStatus} onPriority={onPriority} onReset={onReset} />
    {loading && allTasks.length === 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading assigned tasks">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-muted" />)}</div> : tasks.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={onOpen} />)}</div> : <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">{allTasks.length ? <SearchX className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" /> : <ClipboardList className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />}<h3 className="mt-3 font-semibold">{allTasks.length ? "No tasks match these filters" : "Your task list is clear"}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{allTasks.length ? "Try changing the search or filters to find the task you need." : "New work assigned to you will appear here. Your team admin manages task assignments."}</p>{allTasks.length > 0 && <button type="button" onClick={onReset} className="mt-4 text-sm font-semibold text-primary hover:underline">Clear filters</button>}</div>}
  </CardContent></Card>;
}
