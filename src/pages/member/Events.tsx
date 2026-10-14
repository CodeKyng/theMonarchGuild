import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, ArrowUpRight, CalendarDays, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import EventsFilters from "@/components/member/events/EventsFilters";
import EventDetailsDialog from "@/components/member/events/EventDetailsDialog";
import EventsGrid from "@/components/member/events/EventsGrid";
import EventsHeader from "@/components/member/events/EventsHeader";
import EventsSummary, { type MemberEvent } from "@/components/member/events/EventsSummary";
import { db } from "@/firebase";

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function fromDocument(id: string, data: Record<string, unknown>): MemberEvent {
  return { id, title: text(data.title) || "Guild event", presenter: text(data.presenter) || text(data.host), date: readDate(data.date), time: text(data.time), venue: text(data.venue) || text(data.location), description: text(data.description) || text(data.details), ticketLink: text(data.ticketLink) || text(data.registrationUrl) || text(data.url), status: text(data.status) || "Upcoming" };
}
function startOfToday() { const today = new Date(); today.setHours(0, 0, 0, 0); return today; }

export default function MemberEvents() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<MemberEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => onSnapshot(collection(db, "events"), (snapshot) => {
    const rows = snapshot.docs.map((entry) => fromDocument(entry.id, entry.data())).filter((event) => !["cancelled", "canceled", "draft", "archived"].includes(event.status.toLowerCase()));
    setEvents(rows);
    setError("");
    setLoading(false);
  }, (loadError) => {
    console.error("Failed to load member events:", loadError);
    setError("Guild events could not be loaded. Check your connection and try again.");
    setLoading(false);
  }), [retryToken]);

  const filteredEvents = useMemo(() => {
    const today = startOfToday().getTime();
    const needle = search.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const time = event.date?.getTime();
      const inTimeframe = timeframe === "all" || (timeframe === "past" ? time !== undefined && time < today : time === undefined || time >= today);
      const searchable = [event.title, event.presenter, event.venue, event.description, event.time].join(" ").toLocaleLowerCase();
      return inTimeframe && (!needle || searchable.includes(needle));
    }).sort((a, b) => {
      const aTime = a.date?.getTime(); const bTime = b.date?.getTime();
      if (timeframe === "past") return (bTime ?? 0) - (aTime ?? 0);
      if (aTime === undefined && bTime === undefined) return 0;
      const aFuture = aTime === undefined || aTime >= today; const bFuture = bTime === undefined || bTime >= today;
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      if (aTime === undefined) return 1;
      if (bTime === undefined) return -1;
      return aFuture ? aTime - bTime : bTime - aTime;
    });
  }, [events, search, timeframe]);

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6"><EventsHeader /><EventsSummary events={events} />{error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" /><p className="text-sm leading-5 text-destructive">{error}</p></div><button type="button" onClick={() => { setLoading(true); setError(""); setRetryToken((value) => value + 1); }} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"><RefreshCw className="size-4" aria-hidden="true" />Try again</button></div>}<EventsFilters search={search} timeframe={timeframe} onSearch={setSearch} onTimeframe={setTimeframe} /><EventsGrid events={filteredEvents} loading={loading} hasFilters={Boolean(search.trim()) || timeframe !== "upcoming"} timeframe={timeframe} onView={setSelectedEvent} /><section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-4" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Bring your curiosity</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Meet builders, share what you’re learning, and discover new ways to contribute.</p></div></div><Link to="/member/community" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline">Join the conversation<ArrowUpRight className="size-4" aria-hidden="true" /></Link></section><EventDetailsDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} /></main>;
}
