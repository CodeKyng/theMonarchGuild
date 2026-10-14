import { CalendarCheck2, CalendarClock, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface MemberEvent { id: string; title: string; presenter: string; date: Date | null; time: string; venue: string; description: string; ticketLink: string; status: string; }

export default function EventsSummary({ events }: { events: MemberEvent[] }) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = events.filter((event) => !event.date || event.date >= now);
  const thisMonth = upcoming.filter((event) => event.date && event.date.getMonth() === now.getMonth() && event.date.getFullYear() === now.getFullYear()).length;
  const online = upcoming.filter((event) => /online|virtual|zoom|discord|meet\.google|youtube|twitter space/i.test(event.venue)).length;
  const stats = [
    { label: "Upcoming events", value: upcoming.length, detail: "On the Guild calendar", icon: CalendarClock, tone: "text-orange-600 bg-orange-500/10" },
    { label: "This month", value: thisMonth, detail: "Dates to plan for", icon: CalendarCheck2, tone: "text-violet-600 bg-violet-500/10" },
    { label: "Online sessions", value: online, detail: "Join from anywhere", icon: Video, tone: "text-sky-600 bg-sky-500/10" },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, detail, icon: Icon, tone }) => <Card key={label} className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label} · {detail}</p></div></CardContent></Card>)}</div>;
}
