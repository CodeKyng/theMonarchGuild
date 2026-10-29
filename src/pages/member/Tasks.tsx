import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { ExternalLink, ListTodo, RefreshCw, Send, Wallet, Banknote } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

const MIN_WITHDRAWAL = 10;

interface SubmitForm {
  proofUrl: string;
  proofNote: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  walletAddress: string;
  createdAt: Date | null;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

export default function MemberTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CommunityTask[]>([]);
  const [mySubmissions, setMySubmissions] = useState<TaskSubmission[]>([]);
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CommunityTask | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitForm>({
    defaultValues: { proofUrl: "", proofNote: "" },
  });

  useEffect(() => {
    if (!user) return;
    setWalletLoading(true);
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data() ?? {};
        const address = typeof data.walletAddress === "string" ? data.walletAddress : "";
        setLinkedWallet(address.startsWith("0x") && address.length === 42 ? address : null);
        setWalletLoading(false);
      },
      () => {
        setLinkedWallet(null);
        setWalletLoading(false);
      },
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "withdrawalRequests"), where("userId", "==", user.uid)),
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            amount: typeof data.amount === "number" ? data.amount : 0,
            status: typeof data.status === "string" ? data.status : "Pending",
            walletAddress: typeof data.walletAddress === "string" ? data.walletAddress : "",
            createdAt: toDate(data.createdAt),
          } satisfies WithdrawalRequest;
        });
        rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
        setWithdrawals(rows);
      },
      (err) => console.error("Failed to load withdrawals:", err),
    );
  }, [user]);

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

  const totalEarned = useMemo(
    () =>
      mySubmissions
        .filter((s) => s.status === "Rewarded" || s.status === "Approved")
        .reduce((sum, s) => sum + (Number.isFinite(s.rewardAmount) ? s.rewardAmount : 0), 0),
    [mySubmissions],
  );

  const withdrawnOrPending = useMemo(
    () =>
      withdrawals
        .filter((w) => w.status === "Pending" || w.status === "Paid" || w.status === "Processing")
        .reduce((sum, w) => sum + w.amount, 0),
    [withdrawals],
  );

  const availableBalance = Math.max(0, totalEarned - withdrawnOrPending);

  const onSubmit: SubmitHandler<SubmitForm> = async (values) => {
    if (!user || !selected) return;
    setSubmitError("");
    setSubmitSuccess("");

    if (!linkedWallet) {
      setSubmitError("Connect and link a wallet on your profile before submitting proof.");
      return;
    }

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
        walletAddress: linkedWallet,
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

  async function requestWithdrawal() {
    if (!user || !linkedWallet) return;
    setWithdrawError("");
    setWithdrawSuccess("");
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawError("Enter a valid amount.");
      return;
    }
    if (amount < MIN_WITHDRAWAL) {
      setWithdrawError(`Minimum withdrawal is $${MIN_WITHDRAWAL}.`);
      return;
    }
    if (amount > availableBalance) {
      setWithdrawError(`You only have $${availableBalance.toFixed(2)} available.`);
      return;
    }
    setWithdrawBusy(true);
    try {
      await addDoc(collection(db, "withdrawalRequests"), {
        userId: user.uid,
        userName: user.displayName || user.email || "Member",
        walletAddress: linkedWallet,
        amount,
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        processedAt: null,
        processedBy: null,
        note: "",
      });
      setWithdrawSuccess(`Withdrawal of $${amount.toFixed(2)} requested. Staff will process it soon.`);
      setWithdrawAmount("");
      setWithdrawOpen(false);
    } catch (e) {
      console.error("Withdrawal request failed:", e);
      setWithdrawError("Could not submit withdrawal. Try again.");
    } finally {
      setWithdrawBusy(false);
    }
  }

  function openSubmit(task: CommunityTask) {
    if (!linkedWallet) return;
    setSelected(task);
    setSubmitError("");
    reset();
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      Pending: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
      Approved: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
      Rejected: "bg-destructive/15 text-destructive",
      Rewarded: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      Processing: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
      Paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status] ?? "bg-muted"}`}>{status}</span>;
  }

  const shortWallet = linkedWallet
    ? `${linkedWallet.slice(0, 6)}…${linkedWallet.slice(-4)}`
    : null;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            <ListTodo className="size-4" aria-hidden="true" />
            Earn rewards
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Community tasks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Complete X or Telegram tasks, submit proof, and earn after staff verification. A linked wallet is required.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total earned</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Available to withdraw</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            ${availableBalance.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wallet className="size-3.5" aria-hidden="true" />
                Linked wallet
              </p>
              {walletLoading ? (
                <p className="mt-1 text-sm text-muted-foreground">Checking…</p>
              ) : linkedWallet ? (
                <p className="mt-1 truncate font-mono text-sm" title={linkedWallet}>
                  {shortWallet}
                </p>
              ) : (
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">Not connected — required for tasks</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!linkedWallet && (
                <Link
                  to="/member/profile"
                  className="inline-flex h-8 items-center justify-center rounded-4xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  Connect wallet
                </Link>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!linkedWallet || availableBalance < MIN_WITHDRAWAL}
                onClick={() => {
                  setWithdrawOpen(true);
                  setWithdrawError("");
                  setWithdrawAmount(
                    availableBalance >= MIN_WITHDRAWAL
                      ? String(Math.floor(availableBalance * 100) / 100)
                      : "",
                  );
                }}
              >
                <Banknote className="size-4" aria-hidden="true" />
                Withdraw
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Minimum withdrawal: ${MIN_WITHDRAWAL}.00</p>
        </div>
      </section>

      {withdrawSuccess && (
        <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          {withdrawSuccess}
        </div>
      )}

      {!walletLoading && !linkedWallet && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-amber-900 dark:text-amber-100">Connect a wallet to perform tasks</p>
            <p className="mt-0.5 text-sm text-amber-800/80 dark:text-amber-200/80">
              Link a wallet on your profile. Submissions use that address automatically — you won’t type it again.
            </p>
          </div>
          <Link
            to="/member/profile"
            className="inline-flex h-8 w-full shrink-0 items-center justify-center rounded-4xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
          >
            Go to profile
          </Link>
        </div>
      )}

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
        <ScrollArea className="h-[min(55vh,32rem)] rounded-xl border border-border">
          <div className="space-y-3 p-3 sm:p-4">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && activeTasks.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No active tasks right now. Check back soon.
              </p>
            )}
            {activeTasks.map((task) => {
              const sub = submissionByTask.get(task.id);
              const full = task.maxCompletions != null && task.completionCount >= task.maxCompletions;
              const canSubmit = Boolean(linkedWallet) && (!sub || sub.status === "Rejected") && !full;
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
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          ${task.rewardAmount.toFixed(2)}
                        </span>
                        {full && <span className="ml-2 text-muted-foreground">(limit reached)</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.actionUrl && (
                        <a
                          href={task.actionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
                        >
                          <ExternalLink className="size-4" aria-hidden="true" />
                          Open task
                        </a>
                      )}
                      {(!sub || sub.status === "Rejected") && (
                        <Button
                          size="sm"
                          className="bg-amber-400 text-black hover:bg-amber-300"
                          disabled={!canSubmit}
                          title={!linkedWallet ? "Connect a wallet first" : full ? "Task full" : undefined}
                          onClick={() => openSubmit(task)}
                        >
                          <Send className="size-4" aria-hidden="true" />
                          Submit proof
                        </Button>
                      )}
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
          </div>
        </ScrollArea>
      </section>

      {mySubmissions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your submissions</h2>
          <ScrollArea className="h-[min(40vh,20rem)] rounded-xl border border-border">
            <div className="space-y-3 p-3 sm:p-4">
              {mySubmissions
                .slice()
                .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-sm"
                  >
                    <div>
                      <p className="font-medium">{s.taskTitle}</p>
                      <p className="text-muted-foreground">
                        ${s.rewardAmount.toFixed(2)}
                        {s.walletAddress && (
                          <>
                            {" "}
                            · {s.walletAddress.slice(0, 6)}…{s.walletAddress.slice(-4)}
                          </>
                        )}
                      </p>
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
            </div>
          </ScrollArea>
        </section>
      )}

      {withdrawals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Withdrawal history</h2>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-sm"
              >
                <div>
                  <p className="font-medium">${w.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.walletAddress ? `${w.walletAddress.slice(0, 6)}…${w.walletAddress.slice(-4)}` : "—"}
                    {w.createdAt && ` · ${w.createdAt.toLocaleDateString()}`}
                  </p>
                </div>
                {statusBadge(w.status)}
              </div>
            ))}
          </div>
        </section>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit proof</DialogTitle>
            <DialogDescription>
              {selected?.title} — ${selected?.rewardAmount.toFixed(2)} after staff approval
            </DialogDescription>
          </DialogHeader>
          {linkedWallet && (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Reward wallet (from your profile):{" "}
              <span className="font-mono text-foreground">{shortWallet}</span>
            </p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="proof-url">
                Proof link (screenshot, post, profile) <span className="text-primary">*</span>
              </Label>
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
              <Textarea
                id="proof-note"
                placeholder="Username, handle, or extra context"
                className="min-h-20"
                {...register("proofNote", { maxLength: 500 })}
              />
            </div>
            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !linkedWallet} className="bg-amber-400 text-black hover:bg-amber-300">
                {isSubmitting ? "Submitting…" : "Submit proof"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={(open) => { if (!withdrawBusy) setWithdrawOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request withdrawal</DialogTitle>
            <DialogDescription>
              Minimum ${MIN_WITHDRAWAL}.00. Funds are sent to your linked wallet after staff processes the request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Available: <span className="font-semibold text-foreground">${availableBalance.toFixed(2)}</span>
            </p>
            {linkedWallet && (
              <p className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs">{linkedWallet}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount ($)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                min={MIN_WITHDRAWAL}
                step="0.01"
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={String(MIN_WITHDRAWAL)}
              />
            </div>
            {withdrawError && (
              <p role="alert" className="text-sm text-destructive">
                {withdrawError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" disabled={withdrawBusy} onClick={() => setWithdrawOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={withdrawBusy || !linkedWallet} onClick={() => void requestWithdrawal()}>
                {withdrawBusy ? "Submitting…" : "Request withdrawal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
