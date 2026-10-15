import { CalendarDays, SearchX } from "lucide-react";
import type { MemberEvent } from "@/components/member/events/EventsSummary";
import StaffEventCard from "@/components/staff/events/StaffEventCard";
import type { StaffEventTimeframe } from "@/components/staff/events/StaffEventsFilterBar";

export default function StaffEventsList({
  events,
  loading,
  hasFilters,
  timeframe,
  onView,
}: {
  events: MemberEvent[];
  loading: boolean;
  hasFilters: boolean;
  timeframe: StaffEventTimeframe;
  onView: (event: MemberEvent) => void;
}) {
  if (loading && events.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading events">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          {hasFilters ? <SearchX className="size-5" aria-hidden="true" /> : <CalendarDays className="size-5" aria-hidden="true" />}
        </span>
        <h3 className="mt-4 font-semibold">
          {hasFilters ? "No events match your search" : timeframe === "past" ? "No past events listed" : "No upcoming events yet"}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          {hasFilters
            ? "Try a different search term or choose another date range."
            : "Guild gatherings will appear here as the calendar is updated."}
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Staff events">
      <p className="mb-3 text-xs text-muted-foreground">
        Showing {events.length} {events.length === 1 ? "event" : "events"}
      </p>
      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => <StaffEventCard key={event.id} event={event} onView={onView} />)}
      </div>
    </section>
  );
}
