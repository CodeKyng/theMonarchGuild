import { BookOpen, GraduationCap, Layers3 } from "lucide-react";
import type { LearningResource } from "@/components/admin/learning-management/types";
import { Card, CardContent } from "@/components/ui/card";

export default function LearningHubSummary({ resources }: { resources: LearningResource[] }) {
  const courses = resources.filter((resource) => resource.format === "Course").length;
  const beginner = resources.filter((resource) => resource.level === "Beginner" || resource.level === "All levels").length;
  const stats = [
    { label: "Published resources", value: resources.length, detail: "Ready to explore", icon: BookOpen, tone: "text-amber-600 bg-amber-500/10" },
    { label: "Courses", value: courses, detail: "Structured learning", icon: GraduationCap, tone: "text-violet-600 bg-violet-500/10" },
    { label: "Beginner friendly", value: beginner, detail: "Start from the basics", icon: Layers3, tone: "text-emerald-600 bg-emerald-500/10" },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, detail, icon: Icon, tone }) => <Card key={label} className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label} · {detail}</p></div></CardContent></Card>)}</div>;
}
