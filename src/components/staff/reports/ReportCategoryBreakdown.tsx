import { ChartNoAxesColumn } from "lucide-react";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportCategoryBreakdown({ reports }: { reports: ModerationReport[] }) {
  const counts = new Map<string, number>();
  reports.forEach((report) => { const category = report.category.trim() || "Uncategorized"; counts.set(category, (counts.get(category) ?? 0) + 1); });
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(1, ...rows.map(([, count]) => count));
  return <Card className="border-border/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ChartNoAxesColumn className="size-4 text-primary" aria-hidden="true" />Reports by category</CardTitle></CardHeader><CardContent>{rows.length ? <div className="space-y-4">{rows.map(([category, count]) => <div key={category}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-medium">{category}</span><span className="shrink-0 text-muted-foreground">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} /></div></div>)}</div> : <p className="py-5 text-sm text-muted-foreground">Category insights will appear when reports are available.</p>}</CardContent></Card>;
}
