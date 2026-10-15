import { ArrowUpRight, CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import type { MemberEvent } from "@/components/member/events/EventsSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export default function StaffEventCard({
  event,
  onView,
}: {
  event: MemberEvent;
  onView: (event: MemberEvent) => void;
}) {
  const isPast = Boolean(event.date && event.date < new Date(new Date().setHours(0, 0, 0, 0)));
  const status = isPast && (!event.status || event.status === "Upcoming")
    ? "Past event"
    : event.status || "Upcoming";
  const dateParts = event.date
    ? {
        month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(event.date),
        day: new Intl.DateTimeFormat(undefined, { day: "2-digit" }).format(event.date),
      }
    : { month: "TBA", day: "—" };

  return (
    <Card className="h-full border-border/70 shadow-sm transition-colors hover:border-primary/25">
      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-14 w-14 shrink-0 content-center justify-items-center rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-200">
            <span className="text-[10px] font-semibold uppercase tracking-widest">{dateParts.month}</span>
            <span className="text-xl font-bold leading-tight">{dateParts.day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${isPast ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
              {status}
            </span>
            <h3 className="mt-2 line-clamp-2 break-words font-semibold leading-5">{event.title}</h3>
          </div>
        </div>

        <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
          {event.description || "Event details will be shared with the Guild soon."}
        </p>

        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{event.date ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(event.date) : "Date to be announced"}</span>
          </p>
          {event.time && (
            <p className="flex items-start gap-2">
              <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{event.time}</span>
            </p>
          )}
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span className="break-words">{event.venue || "Location to be announced"}</span>
          </p>
          {event.presenter && (
            <p className="flex items-start gap-2">
              <UserRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words">Hosted by {event.presenter}</span>
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={() => onView(event)}>
            View details
          </Button>
          {safeUrl(event.ticketLink) && (
            <Button render={<a href={safeUrl(event.ticketLink)} target="_blank" rel="noreferrer" />} size="sm" className="gap-1.5">
              Open link
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
