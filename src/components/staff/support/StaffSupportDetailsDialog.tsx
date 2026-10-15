import { Clock3, Mail, UserRound } from "lucide-react";
import type { SupportTicket } from "@/components/admin/support/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function dateLabel(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date)
    : "Date unavailable";
}

const statusStyles: Record<SupportTicket["status"], string> = {
  Open: "border-amber-500/30 text-amber-700 dark:text-amber-300",
  "In progress": "border-violet-500/30 text-violet-700 dark:text-violet-300",
  "Waiting on member": "border-sky-500/30 text-sky-700 dark:text-sky-300",
  Resolved: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
};

export default function StaffSupportDetailsDialog({
  ticket,
  onClose,
}: {
  ticket: SupportTicket | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(ticket)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        {ticket && (
          <>
            <DialogHeader>
              <DialogTitle className="break-words">{ticket.subject || "Support request"}</DialogTitle>
              <DialogDescription>
                Member request details. This staff view is read-only.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <section className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Member</p>
                  <p className="mt-1 flex items-center gap-2 break-words text-sm font-medium">
                    <UserRound className="size-4 shrink-0" aria-hidden="true" />
                    {ticket.memberName || "Member not identified"}
                  </p>
                  <p className="mt-1 flex items-start gap-2 break-all text-xs text-muted-foreground">
                    <Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {ticket.memberEmail || "Email not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Request information</p>
                  <p className="mt-1 text-sm font-medium">{ticket.category || "General support"}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    Received {dateLabel(ticket.createdAt)}
                  </p>
                  {ticket.assignedTo && (
                    <p className="mt-1 text-xs text-muted-foreground">Assigned to {ticket.assignedTo}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}>
                    {ticket.status}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {ticket.priority} priority
                  </span>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Member’s message</h3>
                <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                  {ticket.message || "No message provided."}
                </p>
              </section>

              {ticket.adminReply && (
                <section>
                  <h3 className="text-sm font-semibold">Recorded response</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-border p-4 text-sm leading-6 text-muted-foreground">
                    {ticket.adminReply}
                  </p>
                </section>
              )}

              <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
                This inbox provides read-only access to ticket details. Contact an administrator to change the ticket status or response.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
