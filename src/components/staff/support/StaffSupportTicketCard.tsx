import { ArrowUpRight, Clock3, UserRound } from "lucide-react";
import type { SupportTicket } from "@/components/admin/support/types";
import { Button } from "@/components/ui/button";

const priorityStyles: Record<SupportTicket["priority"], string> = {
  Urgent: "bg-red-500/10 text-red-700 dark:text-red-300",
  High: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Normal: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Low: "bg-muted text-muted-foreground",
};

const statusStyles: Record<SupportTicket["status"], string> = {
  Open: "border-amber-500/30 text-amber-700 dark:text-amber-300",
  "In progress": "border-violet-500/30 text-violet-700 dark:text-violet-300",
  "Waiting on member": "border-sky-500/30 text-sky-700 dark:text-sky-300",
  Resolved: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
};

function dateLabel(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
    : "Date unavailable";
}

export default function StaffSupportTicketCard({
  ticket,
  onOpen,
}: {
  ticket: SupportTicket;
  onOpen: (ticket: SupportTicket) => void;
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/30 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}>
          {ticket.priority} priority
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>
      <h3 className="mt-4 line-clamp-2 font-semibold leading-6">{ticket.subject || "Support request"}</h3>
      <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
        {ticket.message || "No message provided."}
      </p>
      <div className="mt-4 space-y-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{ticket.memberName || ticket.memberEmail || "Member not identified"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            Received {dateLabel(ticket.createdAt)}{ticket.category ? ` · ${ticket.category}` : ""}
          </span>
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full justify-between"
        onClick={() => onOpen(ticket)}
      >
        View request
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Button>
    </article>
  );
}
