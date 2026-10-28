import { useCallback, useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { ExternalLink, ListTodo, RefreshCw, Send } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { useAuth } from "@/auth/AuthContext";
import {
  submissionFromDocument,
  taskFromDocument,
  type CommunityTask,
  type TaskSubmission,
} from "@/components/tasks/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

interface SubmitForm {
  walletAddress: string;
  proofUrl: string;
  proofNote: string;
}

export default function MemberTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CommunityTask[]>([]);
  const [mySubmissions, setMySubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CommunityTask | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitForm>({
    defaultValues: { walletAddress: "", proofUrl: "", proofNote: "" },
  });

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [tasksSnap, subsSnap] = await Promise.all([
        getDocs(collection(db, "communityTasks")),
        getDocs(query(collection(db, "taskSubmissions"), where("userId", "==", user.uid))),
      ]);
      const taskRows = tasksSnap.docs.map((d) => taskFromDocument(d.id, d.data()));
      taskRows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setTasks(taskRows);
      setMySubmissions(subsSnap.docs.map((d) => submissionFromDocument(d.id, d.data())));
    } catch (e) {
      console.error("Failed to load tasks:", e);
      setError("Could not load tasks. Try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const t = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(t);
  }, [refresh]);

  const submissionByTask = useMemo(() => {
    const map = new Map<string, TaskSubmission>();
    for (const s of mySubmissions) {
      const existing = map.get(s.taskId);
      if (!existing || (s.createdAt?.getTime() ?? 0) > (existing.createdAt?.getTime() ?? 0)) {
        map.set(s.taskId, s);
      }
    }
    return map;
  }, [mySubmissions]);

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "Active"), [tasks]);

  const onSubmit: SubmitHandler<SubmitForm> = async (values) => {
    if (!user || !selected) return;
    setSubmitError("");
    setSubmitSuccess("");
    const existing = submissionByTask.get(selected.id);
    if (existing && (existing.status === "Pending" || existing.status === "Approved" || existing.status === "Rewarded")) {
      setSubmitError("You already have a submission for this task.");
      return;
    }
    if (selected.maxCompletions != null && selected.completionCount >= selected.maxCompletions) {
      setSubmitError("This task has reached its completion limit.");
      return;
    }
    try {
      await addDoc(collection(db, "taskSubmissions"), {
        taskId: selected.id,
        taskTitle: selected.title,
        userId: user.uid,
        userName: user.displayName || user.email || "Member",
        walletAddress: values.walletAddress.trim(),
        proofUrl: values.proofUrl.trim(),
        proofNote: values.proofNote.trim(),
        status: "Pending",
        rewardAmount: selected.rewardAmount,
        reviewedBy: null,
        reviewedByName: null,
        reviewedAt: null,
        reviewNote: "",
        rewardTxHash: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubmitSuccess("Proof submitted! Staff will review it soon.");
      reset();
      setSelected(null);
      void refresh();
    } catch (e) {
      console.error("Failed to submit proof:", e);
      setSubmitError("Submission failed. Check permissions and try again.");
    }
  };

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      Pending: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
      Approved: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
      Rejected: "bg-destructive/15 text-destructive",
      Rewarded: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status] ?? "bg-muted"}`}>{status}</span>;
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            <ListTodo className="size-4" aria-hidden="true" />Earn TMG
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Community tasks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Complete X or Telegram tasks, submit proof, and earn TMG tokens after staff verification.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {submitSuccess && (
        <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          {submitSuccess}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Available tasks</h2>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && activeTasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active tasks right now. Check back soon.
          </p>
        )}
        {activeTasks.map((task) => {
          const sub = submissionByTask.get(task.id);
          const full =
            task.maxCompletions != null && task.completionCount >= task.maxCompletions;
          return (
            <article key={task.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{task.platform}</span>
                    {sub && statusBadge(sub.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <p className="text-sm">
                    <span className="font-medium text-amber-600 dark:text-amber-400">{task.rewardAmount} TMG</span>
                    {full && <span className="ml-2 text-muted-foreground">(limit reached)</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.actionUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={task.actionUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Open task
                      </a>
                    </Button>
                  )}
                  {!sub || sub.status === "Rejected" ? (
                    <Button
                      size="sm"
                      className="bg-amber-400 text-black hover:bg-amber-300"
                      disabled={full}
                      onClick={() => {
                        setSelected(task);
                        setSubmitError("");
                        reset();
                      }}
                    >
                      <Send className="size-4" aria-hidden="true" />
                      Submit proof
                    </Button>
                  ) : null}
                </div>
              </div>
              {task.instructions && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                  {task.instructions}
                </pre>
              )}
            </article>
          );
        })}
      </section>

      {mySubmissions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your submissions</h2>
          {mySubmissions
            .slice()
            .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
            .map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                <div>
                  <p className="font-medium">{s.taskTitle}</p>
                  <p className="text-muted-foreground">{s.rewardAmount} TMG · {s.walletAddress.slice(0, 6)}…{s.walletAddress.slice(-4)}</p>
                  {s.rewardTxHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${s.rewardTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      View reward tx
                    </a>
                  )}
                </div>
                {statusBadge(s.status)}
              </div>
            ))}
        </section>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !isSubmitting) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit proof</DialogTitle>
            <DialogDescription>
              {selected?.title} — {selected?.rewardAmount} TMG after staff approval
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet address (Base Sepolia) <span className="text-primary">*</span></Label>
              <Input
                id="wallet"
                placeholder="0x…"
                aria-invalid={Boolean(errors.walletAddress)}
                {...register("walletAddress", {
                  required: "Enter the wallet that should receive TMG.",
                  validate: (v) => /^0x[a-fA-F0-9]{40}$/.test(v.trim()) || "Enter a valid 0x address.",
                })}
              />
              {errors.walletAddress && <p className="text-xs text-destructive">{errors.walletAddress.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof-url">Proof link (screenshot, post, profile) <span className="text-primary">*</span></Label>
              <Input
                id="proof-url"
                type="url"
                placeholder="https://…"
                aria-invalid={Boolean(errors.proofUrl)}
                {...register("proofUrl", {
                  required: "Add a link to your proof.",
                  validate: (v) => /^https?:\/\//i.test(v.trim()) || "Use a valid http(s) URL.",
                })}
              />
              {errors.proofUrl && <p className="text-xs text-destructive">{errors.proofUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof-note">Note (optional)</Label>
              <Textarea id="proof-note" placeholder="Username, handle, or extra context" className="min-h-20" {...register("proofNote", { maxLength: 500 })} />
            </div>
            {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setSelected(null)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-400 text-black hover:bg-amber-300">
                {isSubmitting ? "Submitting…" : "Submit proof"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
