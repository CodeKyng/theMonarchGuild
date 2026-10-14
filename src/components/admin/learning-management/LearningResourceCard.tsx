import { useState } from "react";
import { ArrowUpRight, BookOpen, Clock3, LoaderCircle, UserRound } from "lucide-react";

import type { LearningResource, LearningStatus } from "@/components/admin/learning-management/types";
import { learningStatuses } from "@/components/admin/learning-management/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusTone: Record<LearningStatus, string> = {
  Draft: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Archived: "bg-muted text-muted-foreground",
};

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function LearningResourceCard({
  resource,
  updating,
  error,
  onStatusChange,
}: {
  resource: LearningResource;
  updating: boolean;
  error: string;
  onStatusChange: (id: string, status: LearningStatus) => Promise<void>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const url = safeHttpUrl(resource.resourceUrl);
  const skills = resource.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean).slice(0, 4);

  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm transition-colors hover:border-primary/30">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" aria-hidden="true" /></span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[resource.status]}`}>{resource.status}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{resource.category || "Guild learning"}</p>
          <CardTitle className="mt-1 break-words text-base">{resource.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 min-h-[4.5rem] whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{resource.summary || "No learning summary has been added yet."}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {[resource.format, resource.level].filter(Boolean).map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>)}
          {skills.map((skill) => <span key={skill} className="max-w-full truncate rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{skill}</span>)}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          {resource.instructor && <p className="flex items-center gap-2"><UserRound className="size-3.5" aria-hidden="true" />{resource.instructor}</p>}
          {resource.duration && <p className="flex items-center gap-2"><Clock3 className="size-3.5" aria-hidden="true" />{resource.duration}</p>}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Select
            value={selectedStatus ?? resource.status}
            onValueChange={(value) => {
              if (!value || value === resource.status) return;
              setSelectedStatus(value);
              void onStatusChange(resource.id, value as LearningStatus).finally(() => setSelectedStatus(null));
            }}
            disabled={updating}
          >
            <SelectTrigger aria-label={`Change publication status for ${resource.title}`} className="h-9 w-full bg-background text-xs sm:w-36">
              {updating && <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{learningStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          {url && <Button type="button" variant="outline" size="sm" render={<a href={url} target="_blank" rel="noreferrer" />} className="gap-1.5"><ArrowUpRight className="size-3.5" aria-hidden="true" />Open resource</Button>}
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
