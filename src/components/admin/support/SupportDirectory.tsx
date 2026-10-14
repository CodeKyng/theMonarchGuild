import { Inbox } from "lucide-react";
import SupportFilters from "@/components/admin/support/SupportFilters";
import TicketCard from "@/components/admin/support/TicketCard";
import type { SupportTicket } from "@/components/admin/support/types";
import { Card, CardContent } from "@/components/ui/card";

export default function SupportDirectory({ tickets, loading, search, status, priority, onSearch, onStatus, onPriority, onOpen }: {
  tickets: SupportTicket[]; loading: boolean; search: string; status: string; priority: string; onSearch: (value: string) => void; onStatus: (value: string) => void; onPriority: (value: string) => void; onOpen: (ticket: SupportTicket) => void;
}) {
  return <Card className="border-border/70 shadow-sm"><CardContent className="space-y-5 p-4 sm:p-6">
    <SupportFilters search={search} status={status} priority={priority} onSearch={onSearch} onStatus={onStatus} onPriority={onPriority} />
    {loading && tickets.length === 0 ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading support tickets">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}</div> : tickets.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />)}</div> : <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center"><Inbox className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" /><h3 className="mt-3 font-semibold">No tickets in this view</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Try another filter. New member requests will appear in this inbox.</p></div>}
  </CardContent></Card>;
}
