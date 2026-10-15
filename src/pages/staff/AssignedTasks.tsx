import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ClipboardCheck, Info, RefreshCw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import TaskDirectory from "@/components/staff/tasks/TaskDirectory";
import TaskDetailsDialog from "@/components/staff/tasks/TaskDetailsDialog";
import TaskSummary from "@/components/staff/tasks/TaskSummary";
import { staffTaskPriorities, staffTaskStatuses, type StaffTask, type StaffTaskStatus } from "@/components/staff/tasks/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function taskFromDocument(id: string, data: Record<string, unknown>): StaffTask {
  const rawStatus = stringValue(data.status);
  const rawPriority = stringValue(data.priority);
  return {
    id,
    title: stringValue(data.title) || "Untitled task",
    description: stringValue(data.description),
    category: stringValue(data.category),
    status: staffTaskStatuses.find((value) => value.toLowerCase() === rawStatus.toLowerCase()) ?? "Assigned",
    priority: staffTaskPriorities.find((value) => value.toLowerCase() === rawPriority.toLowerCase()) ?? "Normal",
    dueAt: readDate(data.dueAt),
    staffNote: stringValue(data.staffNote),
    assignedByName: stringValue(data.assignedByName),
  };
}

export default function StaffAssignedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(query(collection(db, "staffTasks"), where("assignedTo", "==", user.uid)));
      const rows = snapshot.docs.map((entry) => taskFromDocument(entry.id, entry.data()));
      rows.sort((a, b) => {
        if (a.status === "Completed" && b.status !== "Completed") return 1;
        if (a.status !== "Completed" && b.status === "Completed") return -1;
        const aDue = a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDue = b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
      setTasks(rows);
      setSelectedTask((current) => current ? rows.find((task) => task.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load assigned tasks:", loadError);
      setError("Your assigned tasks could not be loaded. Check your connection and task permissions, then try again.");
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesText = !needle || [task.title, task.description, task.category, task.assignedByName].some((value) => value.toLowerCase().includes(needle));
      return matchesText && (status === "all" || task.status === status) && (priority === "all" || task.priority === priority);
    });
  }, [priority, search, status, tasks]);

  function handleSaved(id: string, nextStatus: StaffTaskStatus, staffNote: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: nextStatus, staffNote } : task));
    setSelectedTask((current) => current?.id === id ? { ...current, status: nextStatus, staffNote } : current);
  }

  function resetFilters() { setSearch(""); setStatus("all"); setPriority("all"); }

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><ClipboardCheck className="size-4" aria-hidden="true" />Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Assigned tasks</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Keep track of your work, share progress with the team, and close out completed tasks.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh tasks</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}
    <TaskSummary tasks={tasks} loading={loading} />
    <TaskDirectory tasks={filteredTasks} allTasks={tasks} loading={loading} search={search} status={status} priority={priority} onSearch={setSearch} onStatus={setStatus} onPriority={setPriority} onReset={resetFilters} onOpen={setSelectedTask} />
    <aside className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4"><Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">Your team admin assigns tasks. Open any task to update its status and leave a note about progress or blockers.</p></aside>
    <TaskDetailsDialog key={selectedTask?.id ?? "closed"} task={selectedTask} onClose={() => setSelectedTask(null)} onSaved={handleSaved} />
  </div>;
}
