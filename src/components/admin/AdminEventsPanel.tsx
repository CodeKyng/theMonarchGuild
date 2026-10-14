import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminAddEventDialog from "./AdminAddEventDialog";

export interface AdminEventRow {
  id: string;
  title: string;
  date: Date | null;
  time: string;
  location: string;
  status: string;
}

function formatDate(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function AdminEventsPanel({
  events,
  loading,
  onEventAdded,
}: {
  events: AdminEventRow[];
  loading: boolean;
  onEventAdded: () => void;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-5 sm:items-center sm:gap-4 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base">Guild events</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Events currently listed in the guild calendar.</p>
        </div>
        <div className="shrink-0"><AdminAddEventDialog onEventAdded={onEventAdded} /></div>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
        {loading ? (
          <div className="space-y-3" role="status">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted" />)}<span className="sr-only">Loading guild events</span></div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <CalendarDays className="mx-auto size-7 text-muted-foreground/60" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-foreground">No events listed</p>
            <p className="mt-1 text-xs text-muted-foreground">Events added to the guild calendar will appear here.</p>
          </div>
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-foreground">{event.title}</h3>
                {event.status && <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium capitalize text-amber-800 dark:text-amber-200">{event.status}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden="true" />{event.location || "Location to be announced"}</span>
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
