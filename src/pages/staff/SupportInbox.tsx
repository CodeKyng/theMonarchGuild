import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, LifeBuoy, RefreshCw } from "lucide-react";
import type { SupportPriority, SupportStatus, SupportTicket } from "@/components/admin/support/types";
import { supportPriorities, supportStatuses } from "@/components/admin/support/types";
import StaffSupportDetailsDialog from "@/components/staff/support/StaffSupportDetailsDialog";
import StaffSupportDirectory from "@/components/staff/support/StaffSupportDirectory";
import StaffSupportSummary from "@/components/staff/support/StaffSupportSummary";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function ticketFromDocument(id: string, data: Record<string, unknown>): SupportTicket {
  const rawStatus = asString(data.status).toLowerCase();
  const rawPriority = asString(data.priority).toLowerCase();
  return {
    id,
    subject: asString(data.subject) || asString(data.title),
    message: asString(data.message) || asString(data.description) || asString(data.details),
    category: asString(data.category) || asString(data.topic),
    memberName: asString(data.memberName) || asString(data.userName) || asString(data.name),
    memberEmail: asString(data.memberEmail) || asString(data.userEmail) || asString(data.email),
    assignedTo: asString(data.assignedTo),
    priority: supportPriorities.find((item) => item.toLowerCase() === rawPriority) ?? "Normal",
    status: supportStatuses.find((item) => item.toLowerCase() === rawStatus) ?? "Open",
    adminReply: asString(data.adminReply),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

function sortTickets(tickets: SupportTicket[]) {
  const priorityOrder: Record<SupportPriority, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
  return [...tickets].sort((a, b) => {
    const aResolved = a.status === "Resolved";
    const bResolved = b.status === "Resolved";
    if (aResolved !== bResolved) return aResolved ? 1 : -1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  });
}

export default function StaffSupportInbox() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(
    () =>
      onSnapshot(
        collection(db, "supportTickets"),
        (snapshot) => {
          const rows = sortTickets(
            snapshot.docs.map((entry) => ticketFromDocument(entry.id, entry.data())),
          );
          setTickets(rows);
          setSelected((current) => current ? rows.find((ticket) => ticket.id === current.id) ?? null : null);
          setError("");
          setLoading(false);
        },
        (loadError) => {
          console.error("Failed to load staff support inbox:", loadError);
          setError("Support requests could not be loaded. Check your connection and staff permissions, then try again.");
          setLoading(false);
        },
      ),
    [retryToken],
  );

  const filteredTickets = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = [
        ticket.subject,
        ticket.message,
        ticket.category,
        ticket.memberName,
        ticket.memberEmail,
        ticket.assignedTo,
      ].some((value) => value.toLocaleLowerCase().includes(needle));
      return (
        (!needle || matchesSearch) &&
        (status === "all" || ticket.status === status) &&
        (priority === "all" || ticket.priority === priority)
      );
    });
  }, [tickets, search, status, priority]);

  function refresh() {
    setLoading(true);
    setError("");
    setRetryToken((value) => value + 1);
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setPriority("all");
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 via-card to-card p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
            <LifeBuoy className="size-4" aria-hidden="true" />
            The Monarch Guild · Staff workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Support inbox</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Review member requests, spot urgent issues, and follow each ticket’s progress.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={refresh} disabled={loading} className="shrink-0 bg-background/70">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh inbox
        </Button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm leading-5 text-destructive">{error}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      <StaffSupportSummary tickets={tickets} loading={loading} />
      <StaffSupportDirectory
        tickets={filteredTickets}
        loading={loading}
        search={search}
        status={status}
        priority={priority}
        hasFilters={Boolean(search.trim()) || status !== "all" || priority !== "all"}
        onSearch={setSearch}
        onStatus={(value) => setStatus(value as SupportStatus | "all")}
        onPriority={(value) => setPriority(value as SupportPriority | "all")}
        onClear={clearFilters}
        onOpen={setSelected}
      />
      <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">
        Ticket details are visible to staff for triage. Ticket status, priority, and member responses remain administrator-managed.
      </p>
      <StaffSupportDetailsDialog ticket={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
