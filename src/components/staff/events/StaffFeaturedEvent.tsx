import { ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles, UserRound } from "lucide-react";
import type { MemberEvent } from "@/components/member/events/EventsSummary";

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export default function StaffFeaturedEvent({ event }: { event: MemberEvent | null }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-400/10 via-card to-card p-5 shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
            <Sparkles className="size-4" aria-hidden="true" />
            Coming up next
          </p>
          {event ? (
            <>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                {event.title}
              </h2>
              <p className="mt-2 max-w-2xl line-clamp-2 text-sm leading-6 text-muted-foreground">
                {event.description || "Make space for the next Guild gathering."}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">No upcoming events yet</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                When a new event is added to the Guild calendar, you’ll find its details here.
              </p>
            </>
          )}
        </div>

        {event && (
          <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 sm:grid-cols-2">
            <p className="flex min-w-0 items-start gap-2 text-sm">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{event.date ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(event.date) : "Date to be announced"}</span>
            </p>
            {event.time && (
              <p className="flex min-w-0 items-start gap-2 text-sm">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{event.time}</span>
              </p>
            )}
            <p className="flex min-w-0 items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="break-words">{event.venue || "Location to be announced"}</span>
            </p>
            {event.presenter && (
              <p className="flex min-w-0 items-start gap-2 text-sm">
                <UserRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="break-words">{event.presenter}</span>
              </p>
            )}
            {safeUrl(event.ticketLink) && (
              <a
                href={safeUrl(event.ticketLink)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:col-span-2"
              >
                Open event link
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
