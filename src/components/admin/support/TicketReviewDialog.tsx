import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { LoaderCircle, Mail, UserRound } from "lucide-react";
import type { SupportPriority, SupportStatus, SupportTicket } from "@/components/admin/support/types";
import { supportPriorities, supportStatuses } from "@/components/admin/support/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

function formatDate(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date) : "Date unavailable"; }

export default function TicketReviewDialog({ ticket, onClose, onSaved }: {
  ticket: SupportTicket | null; onClose: () => void; onSaved: (id: string, status: SupportStatus, priority: SupportPriority, reply: string) => void;
}) {
  const [status, setStatus] = useState<SupportStatus>(ticket?.status ?? "Open");
  const [priority, setPriority] = useState<SupportPriority>(ticket?.priority ?? "Normal");
  const [reply, setReply] = useState(ticket?.adminReply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!ticket) return;
    setSaving(true); setError("");
    try {
      await updateDoc(doc(db, "supportTickets", ticket.id), { status, priority, adminReply: reply.trim(), updatedAt: serverTimestamp() });
      onSaved(ticket.id, status, priority, reply.trim()); onClose();
    } catch (saveError) {
      console.error("Failed to save support ticket:", saveError);
      setError("Changes could not be saved. Check your connection and permissions, then try again.");
    } finally { setSaving(false); }
  }

  return <Dialog open={Boolean(ticket)} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
      {ticket && <><DialogHeader><DialogTitle className="break-words">{ticket.subject || "Support request"}</DialogTitle><DialogDescription>Review the member’s request, update its priority and status, and record the response.</DialogDescription></DialogHeader>
        <div className="space-y-5">
          <section className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">Member</p><p className="mt-1 flex items-center gap-2 break-words text-sm font-medium"><UserRound className="size-4 shrink-0" aria-hidden="true" />{ticket.memberName || "Member not identified"}</p><p className="mt-1 break-all text-xs text-muted-foreground">{ticket.memberEmail || "Email not provided"}</p></div>
            <div><p className="text-xs text-muted-foreground">Request information</p><p className="mt-1 text-sm font-medium">{ticket.category || "General support"}</p><p className="mt-1 text-xs text-muted-foreground">Received {formatDate(ticket.createdAt)}</p>{ticket.assignedTo && <p className="mt-1 text-xs text-muted-foreground">Assigned to {ticket.assignedTo}</p>}</div>
          </section>
          <section><h3 className="text-sm font-semibold">Member’s message</h3><p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">{ticket.message || "No message provided."}</p></section>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Ticket status</Label><Select value={status} onValueChange={(value) => { if (value) setStatus(value as SupportStatus); }} disabled={saving}><SelectTrigger aria-label="Ticket status" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{supportStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Priority</Label><Select value={priority} onValueChange={(value) => { if (value) setPriority(value as SupportPriority); }} disabled={saving}><SelectTrigger aria-label="Ticket priority" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{supportPriorities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="support-admin-reply">Admin response</Label><Textarea id="support-admin-reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write the response or resolution summary…" className="min-h-28 resize-y" maxLength={3000} disabled={saving} /><p className="text-xs text-muted-foreground">Saved to the ticket record; sending an email to the member is not connected.</p></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="button" onClick={() => void save()} disabled={saving} className="bg-amber-400 text-black hover:bg-amber-300">{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}{saving ? "Saving…" : "Save ticket"}</Button></div>
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}
