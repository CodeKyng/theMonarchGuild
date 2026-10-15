import { CalendarClock, CalendarDays, History, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MemberEvent } from "@/components/member/events/EventsSummary";

export default function StaffEventsSummary({ events }: { events: MemberEvent[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeEvents = events.filter(
    (event) => !["cancelled", "canceled", "draft", "archived"].includes(event.status.toLowerCase()),
  );
  const upcoming = activeEvents.filter((event) => !event.date || event.date >= today);
  const thisMonth = upcoming.filter(
    (event) =>
      event.date &&
      event.date.getMonth() === today.getMonth() &&
      event.date.getFullYear() === today.getFullYear(),
  ).length;
  const past = activeEvents.filter((event) => event.date && event.date < today).length;
  const cards: { label: string; value: number; detail: string; icon: LucideIcon; tone: string }[] = [
    {
      label: "Upcoming events",
      value: upcoming.length,
      detail: "Active on the Guild calendar",
      icon: CalendarClock,
      tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    },
    {
      label: "This month",
      value: thisMonth,
      detail: "Dates to coordinate",
      icon: CalendarDays,
      tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    {
      label: "Past events",
      value: past,
      detail: "Completed Guild gatherings",
      icon: History,
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <section aria-label="Event overview" className="grid gap-4 sm:grid-cols-3">
      {cards.map(({ label, value, detail, icon: Icon, tone }) => (
        <Card key={label} className="border-border/70 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
