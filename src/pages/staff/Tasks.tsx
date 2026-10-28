import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ClipboardCheck, RefreshCw, Sparkles, UserSquare2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase";

type JobTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignedByName: string;
  dueAt?: Date | null;
};

type SocialTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  tokenReward: number;
  status: string;
};

type Submission = {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  status: string;
  tokenReward: number;
  reviewedAt?: Date | null;
};

function asString(value: unknown) { return typeof value === "string" ? value : ""; }
function asNumber(value: unknown) { return typeof value === "number" && Number.isFinite(value) ? value : 0; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

export default function StaffTasksPage() {
  const { user } = useAuth();
  const [jobTasks, setJobTasks] = useState<JobTask[]>([]);
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [jobTaskSnapshot, socialTaskSnapshot, submissionsSnapshot] = await Promise.all([
        getDocs(query(collection(db, "staffTasks"), where("assignedTo", "==", user.uid))),
        getDocs(collection(db, "socialTasks")),
        getDocs(collection(db, "socialTaskSubmissions")),
      ]);

      const jobs = jobTaskSnapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          title: asString(data.title) || "Untitled task",
          description: asString(data.description),
          status: asString(data.status),
          priority: asString(data.priority),
          category: asString(data.category),
          assignedByName: asString(data.assignedByName),
          dueAt: readDate(data.dueAt),
        } satisfies JobTask;
      }).sort((a, b) => {
        if (a.status === "Completed" && b.status !== "Completed") return 1;
        if (a.status !== "Completed" && b.status === "Completed") return -1;
        const aDue = a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDue = b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });

      const social = socialTaskSnapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          title: asString(data.title) || "Untitled task",
          description: asString(data.description),
          category: asString(data.category),
          platform: asString(data.platform),
          tokenReward: asNumber(data.tokenReward),
          status: asString(data.status),
        } satisfies SocialTask;
      });

      const allSubmissions = submissionsSnapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          taskId: asString(data.taskId),
          taskTitle: asString(data.taskTitle),
          userId: asString(data.userId),
          userName: asString(data.userName),
          status: asString(data.status),
          tokenReward: asNumber(data.tokenReward),
          reviewedAt: readDate(data.reviewedAt),
        } satisfies Submission;
      }).sort((a, b) => {
        const timeA = a.reviewedAt?.getTime() ?? Number.MIN_SAFE_INTEGER;
        const timeB = b.reviewedAt?.getTime() ?? Number.MIN_SAFE_INTEGER;
        return timeB - timeA;
      });

      setJobTasks(jobs);
      setSocialTasks(social);
      setSubmissions(allSubmissions);
    } catch (loadError) {
      console.error("Failed to load tasks overview:", loadError);
      setError("Task data could not be loaded. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const pendingReviews = useMemo(() => submissions.filter((entry) => entry.status === "Pending").length, [submissions]);

  if (!user) return null;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 rounded-3xl border border-primary/15 bg-primary/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary"><ClipboardCheck className="size-4" aria-hidden="true" />Guild Tasks</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Social tasks & assigned job work</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Review incoming social task submissions, keep job tasks moving, and reward completed work after approval.</p>
        </div>
        <Button type="button" variant="outline" className="shrink-0" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assigned job tasks</p>
              <p className="mt-2 text-3xl font-semibold">{jobTasks.length}</p>
            </div>
            <div className="grid size-11 place-items-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300"><ClipboardCheck className="size-5" aria-hidden="true" /></div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active social tasks</p>
              <p className="mt-2 text-3xl font-semibold">{socialTasks.length}</p>
            </div>
            <div className="grid size-11 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><Sparkles className="size-5" aria-hidden="true" /></div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending submissions</p>
              <p className="mt-2 text-3xl font-semibold">{pendingReviews}</p>
            </div>
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><UserSquare2 className="size-5" aria-hidden="true" /></div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Assigned job tasks</CardTitle>
            <CardDescription>Work assigned directly to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <div className="h-24 animate-pulse rounded-xl bg-muted" /> : jobTasks.length === 0 ? <p className="text-sm text-muted-foreground">No assigned job tasks right now.</p> : jobTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{task.status}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{task.priority}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                {task.dueAt && <p className="mt-2 text-xs text-muted-foreground">Due {task.dueAt.toLocaleDateString()}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Social task catalog</CardTitle>
            <CardDescription>Community tasks members can complete for token rewards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <div className="h-24 animate-pulse rounded-xl bg-muted" /> : socialTasks.length === 0 ? <p className="text-sm text-muted-foreground">No active social tasks are available right now.</p> : socialTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{task.category}</p>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">+{task.tokenReward}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">Platform: {task.platform}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Submission updates</CardTitle>
          <CardDescription>Latest review decisions on social task submissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <div className="h-24 animate-pulse rounded-xl bg-muted" /> : submissions.length === 0 ? <p className="text-sm text-muted-foreground">No social task submissions have been made yet.</p> : submissions.slice(0, 8).map((submission) => (
            <div key={submission.id} className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{submission.taskTitle}</p>
                <p className="text-xs text-muted-foreground">{submission.userName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{submission.status}</span>
                <span className="text-sm font-medium text-primary">+{submission.tokenReward}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
