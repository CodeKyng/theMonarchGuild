import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CalendarClock, LoaderCircle, UserRound } from "lucide-react";
import type { StaffTask, StaffTaskStatus } from "./types";
import { staffTaskStatuses } from "./types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

export default function TaskDetailsDialog({ task, onClose, onSaved }: { task: StaffTask | null; onClose: () => void; onSaved: (id: string, status: StaffTaskStatus, staffNote: string) => void }) {
  const [status, setStatus] = useState<StaffTaskStatus>(task?.status ?? "Assigned");
  const [staffNote, setStaffNote] = useState(task?.staffNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!task) return;
    setSaving(true); setError("");
    try {
      await updateDoc(doc(db, "staffTasks", task.id), { status, staffNote: staffNote.trim(), updatedAt: serverTimestamp() });
      onSaved(task.id, status, staffNote.trim());
      onClose();
    } catch (saveError) {
      console.error("Failed to update assigned task:", saveError);
      setError("Your update could not be saved. Check your connection and task permissions, then try again.");
    } finally { setSaving(false); }
  }

  const dueLabel = task?.dueAt ? new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(task.dueAt) : "No due date";
  return <Dialog open={Boolean(task)} onOpenChange={(open) => { if (!open && !saving) onClose(); }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="pr-5">{task?.title ?? "Task details"}</DialogTitle><DialogDescription>Review the assignment and leave an update for your team.</DialogDescription></DialogHeader>{task && <div className="space-y-5">
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">{task.priority} priority</span>{task.category && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{task.category}</span>}</div>
    <div className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-2"><div className="flex items-center gap-2 text-sm"><CalendarClock className="size-4 text-muted-foreground" aria-hidden="true" /><span><span className="font-medium">Due:</span> <span className="text-muted-foreground">{dueLabel}</span></span></div>{task.assignedByName && <div className="flex items-center gap-2 text-sm"><UserRound className="size-4 text-muted-foreground" aria-hidden="true" /><span><span className="font-medium">Assigned by</span> <span className="text-muted-foreground">{task.assignedByName}</span></span></div>}</div>
    <div><h3 className="text-sm font-semibold">Task details</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{task.description || "No additional details were provided."}</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="staff-task-status">Status</Label><Select value={status} onValueChange={(value) => setStatus((value as StaffTaskStatus | null) ?? "Assigned")}><SelectTrigger id="staff-task-status" className="w-full bg-background"><SelectValue /></SelectTrigger><SelectContent>{staffTaskStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="staff-task-note">Update for your team</Label><Textarea id="staff-task-note" value={staffNote} onChange={(event) => setStaffNote(event.target.value)} placeholder="Share progress, blockers, or what happens next…" rows={4} maxLength={2000} /><p className="text-right text-xs text-muted-foreground">{staffNote.length}/2000</p></div></div>
    {error && <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="button" onClick={() => void save()} disabled={saving}>{saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}Save update</Button></div>
  </div>}</DialogContent></Dialog>;
}
