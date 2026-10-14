import { CheckCircle2, Clock3, LifeBuoy, MessageCircleMore } from "lucide-react";
import type { SupportTicket } from "@/components/admin/support/types";

export default function SupportSummary({ tickets, loading }: { tickets: SupportTicket[]; loading: boolean }) {
  const open = tickets.filter((ticket) => ticket.status === "Open").length;
  const active = tickets.filter((ticket) => ticket.status === "In progress" || ticket.status === "Waiting on member").length;
  const resolved = tickets.filter((ticket) => ticket.status === "Resolved").length;
  const cards = [
    { label: "Total tickets", value: tickets.length, icon: LifeBuoy, tone: "text-sky-600 bg-sky-500/10" },
    { label: "Needs attention", value: open, icon: MessageCircleMore, tone: "text-amber-700 bg-amber-500/10" },
    { label: "In progress", value: active, icon: Clock3, tone: "text-violet-600 bg-violet-500/10" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-500/10" },
  ];
  return <section aria-label="Support overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" aria-hidden="true" /></span></div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" /> : value}</p>
    </article>)}
  </section>;
}
