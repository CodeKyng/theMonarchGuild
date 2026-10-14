import { useState } from "react";
import { ArrowUpRight, CalendarDays, CircleUserRound, FolderKanban, LoaderCircle } from "lucide-react";

import type { AdminProject, ProjectStatus } from "@/components/admin/projects/types";
import { projectStatuses } from "@/components/admin/projects/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusTone: Record<ProjectStatus, string> = {
  Planning: "bg-muted text-muted-foreground",
  Recruiting: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "In progress": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "On hold": "bg-amber-500/10 text-amber-800 dark:text-amber-200",
};

function safeProjectUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(value) : "Date not available";
}

export default function ProjectCard({
  project,
  updating,
  error,
  onStatusChange,
}: {
  project: AdminProject;
  updating: boolean;
  error: string;
  onStatusChange: (projectId: string, status: ProjectStatus) => Promise<void>;
}) {
  const [statusMenuValue, setStatusMenuValue] = useState<string | null>(null);
  const projectUrl = safeProjectUrl(project.projectUrl);
  const skills = project.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean).slice(0, 5);

  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm transition-colors hover:border-primary/30">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FolderKanban className="size-5" aria-hidden="true" /></span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[project.status]}`}>{project.status}</span>
        </div>
        <div className="min-w-0">
          {project.category && <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{project.category}</p>}
          <CardTitle className="mt-1 break-words text-base">{project.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 min-h-[4.5rem] whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{project.description || "No project description has been added yet."}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {skills.length ? skills.map((skill) => <span key={skill} className="max-w-full truncate rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{skill}</span>) : <span className="text-xs text-muted-foreground">Skills not specified</span>}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          {project.owner && <p className="flex items-center gap-2"><CircleUserRound className="size-3.5" aria-hidden="true" />Owner: <span className="truncate text-foreground">{project.owner}</span></p>}
          <p className="flex items-center gap-2"><CalendarDays className="size-3.5" aria-hidden="true" />Created {formatDate(project.createdAt)}</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Select
            value={statusMenuValue ?? project.status}
            onValueChange={(value) => {
              if (!value || value === project.status) return;
              setStatusMenuValue(value);
              void onStatusChange(project.id, value as ProjectStatus).finally(() => setStatusMenuValue(null));
            }}
            disabled={updating}
          >
            <SelectTrigger aria-label={`Change status for ${project.title}`} className="h-9 w-full bg-background text-xs sm:w-40">
              {updating && <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{projectStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          {projectUrl && <Button type="button" variant="outline" size="sm" render={<a href={projectUrl} target="_blank" rel="noreferrer" />} className="gap-1.5"><ArrowUpRight className="size-3.5" aria-hidden="true" />Open project</Button>}
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
