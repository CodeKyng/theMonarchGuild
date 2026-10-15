import { CheckCircle2, Clock3, LifeBuoy, MessageCircleMore } from "lucide-react";
import type { SupportTicket } from "@/components/admin/support/types";

export default function StaffSupportSummary({
  tickets,
  loading,
}: {
  tickets: SupportTicket[];
  loading: boolean;
}) {
  const open = tickets.filter((ticket) => ticket.status === "Open").length;
  const active = tickets.filter(
    (ticket) => ticket.status === "In progress" || ticket.status === "Waiting on member",
  ).length;
  const resolved = tickets.filter((ticket) => ticket.status === "Resolved").length;
  const metrics = [
    { label: "Total requests", value: tickets.length, icon: LifeBuoy, tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "New requests", value: open, icon: MessageCircleMore, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "In progress", value: active, icon: Clock3, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  ];

  return (
    <section aria-label="Support inbox summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`grid size-9 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
            {loading && tickets.length === 0 ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" aria-label="Loading" />
            ) : value}
          </p>
        </article>
      ))}
    </section>
  );
}
