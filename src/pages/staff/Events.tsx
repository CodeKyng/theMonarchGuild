import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import EventDetailsDialog from "@/components/member/events/EventDetailsDialog";
import type { MemberEvent } from "@/components/member/events/EventsSummary";
import StaffEventsFilterBar, { type StaffEventTimeframe } from "@/components/staff/events/StaffEventsFilterBar";
import StaffEventsList from "@/components/staff/events/StaffEventsList";
import StaffEventsSummary from "@/components/staff/events/StaffEventsSummary";
import StaffFeaturedEvent from "@/components/staff/events/StaffFeaturedEvent";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date =
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function fromDocument(id: string, data: Record<string, unknown>): MemberEvent {
  return {
    id,
    title: text(data.title).trim() || "Guild event",
    presenter: text(data.presenter) || text(data.host),
    date: readDate(data.date),
    time: text(data.time),
    venue: text(data.venue) || text(data.location),
    description: text(data.description) || text(data.details),
    ticketLink: text(data.ticketLink) || text(data.registrationUrl) || text(data.url),
    status: text(data.status) || "Upcoming",
  };
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export default function StaffEvents() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState<StaffEventTimeframe>("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<MemberEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(
    () =>
      onSnapshot(
        collection(db, "events"),
        (snapshot) => {
          const rows = snapshot.docs.map((entry) => fromDocument(entry.id, entry.data()));
          setEvents(
            rows.sort((a, b) => (a.date?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.date?.getTime() ?? Number.MAX_SAFE_INTEGER)),
          );
          setError("");
          setLoading(false);
        },
        (loadError) => {
          console.error("Failed to load staff events:", loadError);
          setError("Guild events could not be loaded. Check your connection and try again.");
          setLoading(false);
        },
      ),
    [retryToken],
  );

  const featuredEvent = useMemo(() => {
    const today = startOfToday();
    return events.find(
      (event) =>
        !["cancelled", "canceled", "draft", "archived"].includes(event.status.toLowerCase()) &&
        (!event.date || event.date.getTime() >= today),
    ) ?? null;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const today = startOfToday();
    const needle = search.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const time = event.date?.getTime();
      const dateMatches =
        timeframe === "all" ||
        (timeframe === "past"
          ? time !== undefined && time < today
          : time === undefined || time >= today);
      const searchable = [
        event.title,
        event.presenter,
        event.venue,
        event.description,
        event.time,
        event.status,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return dateMatches && (!needle || searchable.includes(needle));
    });
  }, [events, search, timeframe]);

  const refresh = () => {
    setLoading(true);
    setError("");
    setRetryToken((value) => value + 1);
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            The Monarch Guild · Staff workspace
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            <CalendarDays className="size-7 text-primary" aria-hidden="true" />
            Events
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep track of upcoming Guild gatherings, hosts, and event details.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh events
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

      <StaffEventsSummary events={events} />
      <StaffFeaturedEvent event={featuredEvent} />
      <StaffEventsFilterBar
        search={search}
        timeframe={timeframe}
        onSearch={setSearch}
        onTimeframe={setTimeframe}
      />
      <StaffEventsList
        events={filteredEvents}
        loading={loading}
        hasFilters={Boolean(search.trim()) || timeframe !== "upcoming"}
        timeframe={timeframe}
        onView={setSelectedEvent}
      />
      <EventDetailsDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
