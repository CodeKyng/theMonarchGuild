import { Inbox, SearchX } from "lucide-react";
import type { SupportTicket } from "@/components/admin/support/types";
import StaffSupportFilters from "@/components/staff/support/StaffSupportFilters";
import StaffSupportTicketCard from "@/components/staff/support/StaffSupportTicketCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffSupportDirectory({
  tickets,
  loading,
  search,
  status,
  priority,
  hasFilters,
  onSearch,
  onStatus,
  onPriority,
  onClear,
  onOpen,
}: {
  tickets: SupportTicket[];
  loading: boolean;
  search: string;
  status: string;
  priority: string;
  hasFilters: boolean;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onPriority: (value: string) => void;
  onClear: () => void;
  onOpen: (ticket: SupportTicket) => void;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <StaffSupportFilters
          search={search}
          status={status}
          priority={priority}
          onSearch={onSearch}
          onStatus={onStatus}
          onPriority={onPriority}
        />
        {loading && tickets.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading support requests">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : tickets.length ? (
          <>
            <p className="text-xs text-muted-foreground">
              Showing {tickets.length} {tickets.length === 1 ? "request" : "requests"}
            </p>
            <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tickets.map((ticket) => (
                <StaffSupportTicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
            {hasFilters ? (
              <SearchX className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            ) : (
              <Inbox className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            )}
            <h3 className="mt-3 font-semibold">
              {hasFilters ? "No requests match those filters" : "Your support inbox is clear"}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {hasFilters
                ? "Try another search term, status, or priority."
                : "New member requests will appear here when submitted."}
            </p>
            {hasFilters && (
              <Button type="button" variant="link" onClick={onClear} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
