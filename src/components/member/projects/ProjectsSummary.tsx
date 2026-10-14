import { CheckCircle2, FolderKanban, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminProject } from "@/components/admin/projects/types";

export default function ProjectsSummary({ projects }: { projects: AdminProject[] }) {
  const recruiting = projects.filter((project) => project.status === "Recruiting").length;
  const underway = projects.filter((project) => project.status === "In progress").length;
  const stats = [
    { label: "Guild projects", value: projects.length, detail: "Shared by the guild", icon: FolderKanban, tone: "text-violet-600 bg-violet-500/10" },
    { label: "Recruiting", value: recruiting, detail: "Looking for contributors", icon: Rocket, tone: "text-sky-600 bg-sky-500/10" },
    { label: "In progress", value: underway, detail: "Work you can follow", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-500/10" },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, detail, icon: Icon, tone }) => <Card key={label} className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label} · {detail}</p></div></CardContent></Card>)}</div>;
}
