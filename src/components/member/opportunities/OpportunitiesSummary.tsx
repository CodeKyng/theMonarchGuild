import { BriefcaseBusiness, CircleDollarSign, Globe2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";

export default function OpportunitiesSummary({ opportunities }: { opportunities: AdminOpportunity[] }) {
  const open = opportunities.filter((item) => item.status === "Open");
  const remote = open.filter((item) => /remote/i.test(`${item.arrangement} ${item.location}`)).length;
  const paid = open.filter((item) => item.compensation.trim()).length;
  const stats = [
    { label: "Open opportunities", value: open.length, detail: "Accepting applications", icon: BriefcaseBusiness, tone: "text-emerald-600 bg-emerald-500/10" },
    { label: "Remote friendly", value: remote, detail: "Remote or distributed", icon: Globe2, tone: "text-sky-600 bg-sky-500/10" },
    { label: "Compensation listed", value: paid, detail: "Pay details included", icon: CircleDollarSign, tone: "text-violet-600 bg-violet-500/10" },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, detail, icon: Icon, tone }) => <Card key={label} className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label} · {detail}</p></div></CardContent></Card>)}</div>;
}
