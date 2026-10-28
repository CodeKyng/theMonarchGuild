import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { ListTodo, RefreshCw } from "lucide-react";

import AdminCreateTaskDialog from "@/components/admin/tasks/AdminCreateTaskDialog";
import { taskFromDocument, taskStatuses, type CommunityTask, type TaskStatus } from "@/components/tasks/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/firebase";

export default function AdminTasks() {
  const [tasks, setTasks] = useState<CommunityTask[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "communityTasks"));
      const rows = snapshot.docs.map((entry) => taskFromDocument(entry.id, entry.data()));
      rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setTasks(rows);
    } catch (e) {
      console.error("Failed to load community tasks:", e);
      setError("Tasks could not be loaded. Check connection and Firestore rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(t);
  }, [refresh]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matches =
        !needle ||
        [task.title, task.description, task.platform, task.instructions].some((v) => v.toLowerCase().includes(needle));
      return matches && (status === "all" || task.status === status);
    });
  }, [tasks, search, status]);

  async function updateStatus(id: string, next: TaskStatus) {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "communityTasks", id), { status: next, updatedAt: serverTimestamp() });
      setTasks((current) => current.map((t) => (t.id === id ? { ...t, status: next } : t)));
    } catch (e) {
      console.error("Failed to update task status:", e);
      setError("Could not update task status.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            <ListTodo className="size-4" aria-hidden="true" />Admin · Token tasks
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Community tasks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Create X / Telegram / social tasks. Members submit proof, staff verify, then transfer TMG from your connected wallet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </Button>
          <AdminCreateTaskDialog onCreated={() => void refresh()} />
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {taskStatuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total tasks</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "—" : tasks.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "—" : tasks.filter((t) => t.status === "Active").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Completions</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "—" : tasks.reduce((sum, t) => sum + t.completionCount, 0)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading tasks…</p>}
        {!loading && filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No tasks yet. Create one to get started.
          </p>
        )}
        {filtered.map((task) => (
          <article key={task.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{task.title}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{task.platform}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    task.status === "Active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                    task.status === "Paused" ? "bg-amber-500/15 text-amber-800 dark:text-amber-200" :
                    "bg-muted text-muted-foreground"
                  }`}>{task.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{task.description || task.instructions.slice(0, 120)}</p>
                <p className="text-sm">
                  <span className="font-medium text-amber-600 dark:text-amber-400">{task.rewardAmount} TMG</span>
                  {" · "}
                  {task.completionCount} completion{task.completionCount === 1 ? "" : "s"}
                  {task.maxCompletions != null ? ` / ${task.maxCompletions} max` : ""}
                </p>
                {task.actionUrl && (
                  <a href={task.actionUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-2 hover:underline">
                    Open action link
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {task.status !== "Active" && (
                  <Button size="sm" variant="outline" disabled={updatingId === task.id} onClick={() => void updateStatus(task.id, "Active")}>
                    Activate
                  </Button>
                )}
                {task.status !== "Paused" && (
                  <Button size="sm" variant="outline" disabled={updatingId === task.id} onClick={() => void updateStatus(task.id, "Paused")}>
                    Pause
                  </Button>
                )}
                {task.status !== "Closed" && (
                  <Button size="sm" variant="outline" disabled={updatingId === task.id} onClick={() => void updateStatus(task.id, "Closed")}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
