import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { AlertTriangle, LoaderCircle } from "lucide-react";

import type { ModerationReport, ReportStatus } from "@/components/admin/reports-moderation/types";
import { reportStatuses } from "@/components/admin/reports-moderation/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date) : "Date unavailable";
}

export default function ReportReviewDialog({
  report,
  onClose,
  onSaved,
}: {
  report: ModerationReport | null;
  onClose: () => void;
  onSaved: (id: string, status: ReportStatus, notes: string) => void;
}) {
  const [status, setStatus] = useState<ReportStatus>(report?.status ?? "Under review");
  const [notes, setNotes] = useState(report?.moderationNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveReview() {
    if (!report) return;
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "reports", report.id), {
        status,
        moderationNotes: notes.trim(),
        updatedAt: serverTimestamp(),
      });
      onSaved(report.id, status, notes.trim());
      onClose();
    } catch (saveError) {
      console.error("Failed to save report review:", saveError);
      setError("The review could not be saved. Check your permissions and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(report)} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="max-w-2xl">
        {report && <>
          <DialogHeader>
            <DialogTitle className="break-words">{report.subject || "Community report"}</DialogTitle>
            <DialogDescription>Review the report, record the outcome, and update its queue status.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200"><AlertTriangle className="size-3.5" aria-hidden="true" />{report.severity} priority</span>
              {report.category && <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{report.category}</span>}
              <span className="text-xs text-muted-foreground">Submitted {formatDate(report.createdAt)}</span>
            </div>

            <section className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Reporter</p><p className="mt-1 break-words text-sm font-medium">{report.reporterName || "Not provided"}</p><p className="break-all text-xs text-muted-foreground">{report.reporterEmail}</p></div>
              <div><p className="text-xs text-muted-foreground">Reported account</p><p className="mt-1 break-words text-sm font-medium">{report.reportedUserName || "Not specified"}</p>{report.reportedUserId && <p className="break-all text-xs text-muted-foreground">Account ID: {report.reportedUserId}</p>}</div>
            </section>

            <section>
              <h3 className="text-sm font-semibold">Report details</h3>
              <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">{report.details || "No additional details provided."}</p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Queue status</Label>
                <Select value={status} onValueChange={(value) => { if (value) setStatus(value as ReportStatus); }} disabled={saving}>
                  <SelectTrigger aria-label="Report queue status" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{reportStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderation-notes">Moderator notes</Label>
                <Textarea id="moderation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record the decision or follow-up needed…" className="min-h-20 resize-y" maxLength={1500} disabled={saving} />
              </div>
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="button" onClick={() => void saveReview()} disabled={saving} className="bg-amber-400 text-black hover:bg-amber-300">
                {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}{saving ? "Saving review…" : "Save review"}
              </Button>
            </div>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}
