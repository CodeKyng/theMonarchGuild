import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { CheckCircle2, ClipboardCheck, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import { transfer } from "thirdweb/extensions/erc20";
import { useActiveAccount, useSendTransaction, ConnectButton } from "thirdweb/react";

import { useAuth } from "@/auth/AuthContext";
import {
  submissionFromDocument,
  submissionStatuses,
  type SubmissionStatus,
  type TaskSubmission,
} from "@/components/tasks/types";
import { thirdwebClient, tmgTokenContract } from "@/lib/thirdweb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

export default function StaffTaskVerification() {
  const { user } = useAuth();
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TaskSubmission | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "taskSubmissions"));
      const rows = snap.docs.map((d) => submissionFromDocument(d.id, d.data()));
      rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setSubmissions(rows);
      setSelected((cur) => (cur ? rows.find((r) => r.id === cur.id) ?? null : null));
    } catch (e) {
      console.error("Failed to load submissions:", e);
      setError("Could not load submissions.");
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
    return submissions.filter((s) => {
      const matches =
        !needle ||
        [s.taskTitle, s.userName, s.walletAddress, s.proofUrl].some((v) => v.toLowerCase().includes(needle));
      return matches && (statusFilter === "all" || s.status === statusFilter);
    });
  }, [submissions, search, statusFilter]);

  async function rejectSubmission() {
    if (!user || !selected) return;
    setActionBusy(true);
    setActionError("");
    try {
      await updateDoc(doc(db, "taskSubmissions", selected.id), {
        status: "Rejected",
        reviewedBy: user.uid,
        reviewedByName: user.displayName || user.email || "Staff",
        reviewedAt: serverTimestamp(),
        reviewNote: reviewNote.trim(),
        updatedAt: serverTimestamp(),
      });
      setSelected(null);
      setReviewNote("");
      void refresh();
    } catch (e) {
      console.error(e);
      setActionError("Could not reject submission.");
    } finally {
      setActionBusy(false);
    }
  }

  async function approveAndReward() {
    if (!user || !selected) return;
    if (!account) {
      setActionError("Connect a wallet that holds TMG tokens first.");
      return;
    }
    setActionBusy(true);
    setActionError("");
    try {
      // 1. Transfer TMG from connected staff/admin wallet to member
      const tx = transfer({
        contract: tmgTokenContract,
        to: selected.walletAddress,
        amount: selected.rewardAmount,
      });
      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;

      // 2. Update submission + bump task completion count
      const batch = writeBatch(db);
      batch.update(doc(db, "taskSubmissions", selected.id), {
        status: "Rewarded",
        reviewedBy: user.uid,
        reviewedByName: user.displayName || user.email || "Staff",
        reviewedAt: serverTimestamp(),
        reviewNote: reviewNote.trim(),
        rewardTxHash: txHash,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, "communityTasks", selected.taskId), {
        completionCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      setSelected(null);
      setReviewNote("");
      void refresh();
    } catch (e) {
      console.error("Approve + reward failed:", e);
      setActionError(
        e instanceof Error
          ? e.message
          : "Transfer or save failed. Ensure the connected wallet has enough TMG + gas on Base Sepolia."
      );
    } finally {
      setActionBusy(false);
    }
  }

  function statusBadge(status: SubmissionStatus) {
    const styles: Record<SubmissionStatus, string> = {
      Pending: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
      Approved: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
      Rejected: "bg-destructive/15 text-destructive",
      Rewarded: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>{status}</span>;
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            <ClipboardCheck className="size-4" aria-hidden="true" />Staff · Task verification
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Verify & reward</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Review member proof for community tasks. Connect a wallet that holds TMG, then approve to transfer tokens on Base Sepolia.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ConnectButton client={thirdwebClient} chain={tmgTokenContract.chain} />
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search by task, member, wallet…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "Pending")}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {submissionStatuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {submissionStatuses.map((s) => (
          <div key={s} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="mt-1 text-2xl font-semibold">{loading ? "—" : submissions.filter((x) => x.status === s).length}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No submissions match this filter.
          </p>
        )}
        {filtered.map((s) => (
          <article
            key={s.id}
            className={`cursor-pointer rounded-xl border bg-card p-4 transition-colors sm:p-5 ${
              selected?.id === s.id ? "border-amber-400" : "border-border hover:border-muted-foreground/40"
            }`}
            onClick={() => {
              setSelected(s);
              setReviewNote(s.reviewNote || "");
              setActionError("");
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{s.taskTitle}</h3>
                  {statusBadge(s.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {s.userName} · {s.rewardAmount} TMG · {s.walletAddress.slice(0, 8)}…{s.walletAddress.slice(-4)}
                </p>
              </div>
              {s.proofUrl && (
                <a
                  href={s.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="size-3.5" /> Proof
                </a>
              )}
            </div>
            {s.proofNote && <p className="mt-2 text-sm text-muted-foreground">{s.proofNote}</p>}
          </article>
        ))}
      </div>

      {selected && (
        <aside className="sticky bottom-4 rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:p-5">
          <h3 className="font-semibold">Review: {selected.taskTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {selected.userName} → {selected.walletAddress} · {selected.rewardAmount} TMG
          </p>
          {selected.proofUrl && (
            <a href={selected.proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline">
              <ExternalLink className="size-3.5" /> Open proof
            </a>
          )}
          <div className="mt-3 space-y-2">
            <Label htmlFor="review-note">Review note</Label>
            <Textarea
              id="review-note"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Optional note for the member"
              className="min-h-16"
              disabled={selected.status !== "Pending"}
            />
          </div>
          {actionError && <p role="alert" className="mt-2 text-sm text-destructive">{actionError}</p>}
          {selected.status === "Pending" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={actionBusy || isSending}
                onClick={() => void rejectSubmission()}
              >
                <XCircle className="size-4" aria-hidden="true" />
                Reject
              </Button>
              <Button
                type="button"
                className="bg-amber-400 text-black hover:bg-amber-300"
                disabled={actionBusy || isSending || !account}
                onClick={() => void approveAndReward()}
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {isSending || actionBusy ? "Sending TMG…" : "Approve & send TMG"}
              </Button>
            </div>
          )}
          {selected.status === "Rewarded" && selected.rewardTxHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${selected.rewardTxHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm text-primary underline-offset-2 hover:underline"
            >
              View transaction on BaseScan
            </a>
          )}
          {!account && selected.status === "Pending" && (
            <p className="mt-2 text-xs text-muted-foreground">Connect wallet above to enable reward transfers.</p>
          )}
        </aside>
      )}
    </div>
  );
}
