import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { LifeBuoy, RefreshCw } from "lucide-react";
import SupportSummary from "@/components/admin/support/SupportSummary";
import SupportDirectory from "@/components/admin/support/SupportDirectory";
import TicketReviewDialog from "@/components/admin/support/TicketReviewDialog";
import type { SupportPriority, SupportStatus, SupportTicket } from "@/components/admin/support/types";
import { supportPriorities, supportStatuses } from "@/components/admin/support/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function asString(value: unknown) { return typeof value === "string" ? value : ""; }
function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function ticketFromDocument(id: string, data: Record<string, unknown>): SupportTicket {
  const rawStatus = asString(data.status).toLowerCase();
  const rawPriority = asString(data.priority).toLowerCase();
  return {
    id, subject: asString(data.subject) || asString(data.title), message: asString(data.message) || asString(data.description) || asString(data.details),
    category: asString(data.category) || asString(data.topic), memberName: asString(data.memberName) || asString(data.userName) || asString(data.name),
    memberEmail: asString(data.memberEmail) || asString(data.userEmail) || asString(data.email), assignedTo: asString(data.assignedTo),
    priority: supportPriorities.find((item) => item.toLowerCase() === rawPriority) ?? "Normal",
    status: supportStatuses.find((item) => item.toLowerCase() === rawStatus) ?? "Open",
    adminReply: asString(data.adminReply), createdAt: asDate(data.createdAt), updatedAt: asDate(data.updatedAt),
  };
}
function sortTickets(tickets: SupportTicket[]) {
  const priorityOrder: Record<SupportPriority, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
  return [...tickets].sort((a, b) => {
    const aDone = a.status === "Resolved"; const bDone = b.status === "Resolved";
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
  });
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all"); const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, "supportTickets"));
      const rows = sortTickets(snapshot.docs.map((entry) => ticketFromDocument(entry.id, entry.data())));
      setTickets(rows); setSelected((current) => current ? rows.find((ticket) => ticket.id === current.id) ?? null : null);
    } catch (loadError) { console.error("Failed to load support tickets:", loadError); setError("Support tickets could not be loaded. Check your connection and permissions, then try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tickets.filter((ticket) => (!needle || [ticket.subject, ticket.message, ticket.category, ticket.memberName, ticket.memberEmail, ticket.assignedTo].some((value) => value.toLowerCase().includes(needle))) && (status === "all" || ticket.status === status) && (priority === "all" || ticket.priority === priority));
  }, [tickets, search, status, priority]);
  function handleSaved(id: string, nextStatus: SupportStatus, nextPriority: SupportPriority, reply: string) {
    setTickets((current) => sortTickets(current.map((ticket) => ticket.id === id ? { ...ticket, status: nextStatus, priority: nextPriority, adminReply: reply, updatedAt: new Date() } : ticket)));
    setSelected((current) => current?.id === id ? { ...current, status: nextStatus, priority: nextPriority, adminReply: reply, updatedAt: new Date() } : current);
  }
  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><LifeBuoy className="size-4" aria-hidden="true" />Guild administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Support</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Help members stay unblocked with a clear, responsive process for account, access, and community questions.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh inbox</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}
    <SupportSummary tickets={tickets} loading={loading} />
    <SupportDirectory tickets={filtered} loading={loading} search={search} status={status} priority={priority} onSearch={setSearch} onStatus={setStatus} onPriority={setPriority} onOpen={setSelected} />
    <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">This inbox reads ticket records from the <code className="rounded bg-muted px-1 py-0.5">supportTickets</code> collection. Responses are saved on the ticket; member ticket submission and email delivery are not connected yet.</p>
    <TicketReviewDialog key={selected?.id ?? "closed"} ticket={selected} onClose={() => setSelected(null)} onSaved={handleSaved} />
  </div>;
}
