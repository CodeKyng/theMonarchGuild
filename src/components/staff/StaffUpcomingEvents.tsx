import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type StaffEvent = { id: string; title: string; date: Date | null; time: string; location: string };

function formatDate(date: Date | null) {
  if (!date) return "Date to be announced";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export default function StaffUpcomingEvents({ events, loading }: { events: StaffEvent[]; loading: boolean }) {
  return <Card className="border-border/70 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">On the calendar</p><CardTitle className="mt-1 text-lg">Upcoming events</CardTitle></div><span className="grid size-9 place-items-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300"><CalendarDays className="size-4" aria-hidden="true" /></span></CardHeader>
    <CardContent>
      {loading && events.length === 0 ? <div className="space-y-3" role="status" aria-label="Loading upcoming events">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div> : events.length ? <div className="divide-y divide-border">{events.map((event) => <article key={event.id} className="flex gap-3 py-3 first:pt-1 last:pb-1"><div className="grid h-12 min-w-12 place-items-center rounded-xl bg-muted px-2 text-center"><span className="text-[10px] font-semibold uppercase text-muted-foreground">{event.date ? new Intl.DateTimeFormat(undefined, { month: "short" }).format(event.date) : "TBD"}</span><span className="text-sm font-bold">{event.date ? event.date.getDate() : "—"}</span></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{event.title}</h3><p className="mt-1 text-xs text-muted-foreground">{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}</p>{event.location && <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3 shrink-0" aria-hidden="true" />{event.location}</p>}</div></article>)}</div> : <div className="rounded-xl border border-dashed border-border px-4 py-7 text-center"><p className="text-sm font-medium">Nothing scheduled yet</p><p className="mt-1 text-xs text-muted-foreground">New guild events will show up here.</p></div>}
      <Link to="/staff/events" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">View events<ArrowRight className="size-3.5" aria-hidden="true" /></Link>
    </CardContent>
  </Card>;
}
