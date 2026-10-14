import { useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CircleDollarSign, LoaderCircle, MapPin } from "lucide-react";

import type { AdminOpportunity, OpportunityStatus } from "@/components/admin/opportunities/types";
import { opportunityStatuses } from "@/components/admin/opportunities/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusTone: Record<OpportunityStatus, string> = {
  Open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Reviewing: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Filled: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Closed: "bg-muted text-muted-foreground",
};

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date) : "No deadline";
}

export default function OpportunityCard({
  opportunity,
  updating,
  error,
  onStatusChange,
}: {
  opportunity: AdminOpportunity;
  updating: boolean;
  error: string;
  onStatusChange: (id: string, status: OpportunityStatus) => Promise<void>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const url = safeHttpUrl(opportunity.applicationUrl);
  const skills = opportunity.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean).slice(0, 4);

  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm transition-colors hover:border-primary/30">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="size-5" aria-hidden="true" /></span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[opportunity.status]}`}>{opportunity.status}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{opportunity.organization || "Guild opportunity"}</p>
          <CardTitle className="mt-1 break-words text-base">{opportunity.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 min-h-[4.5rem] whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{opportunity.description || "No listing description has been added yet."}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {skills.length ? skills.map((skill) => <span key={skill} className="max-w-full truncate rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{skill}</span>) : <span className="text-xs text-muted-foreground">Skills not specified</span>}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><BriefcaseBusiness className="size-3.5" aria-hidden="true" />{opportunity.type || "Type not specified"}{opportunity.arrangement ? ` · ${opportunity.arrangement}` : ""}</p>
          <p className="flex items-center gap-2"><MapPin className="size-3.5" aria-hidden="true" />{opportunity.location || "Location not specified"}</p>
          {opportunity.compensation && <p className="flex items-center gap-2"><CircleDollarSign className="size-3.5" aria-hidden="true" />{opportunity.compensation}</p>}
          <p className="flex items-center gap-2"><CalendarDays className="size-3.5" aria-hidden="true" />Apply by {formatDate(opportunity.deadline)}</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Select
            value={selectedStatus ?? opportunity.status}
            onValueChange={(value) => {
              if (!value || value === opportunity.status) return;
              setSelectedStatus(value);
              void onStatusChange(opportunity.id, value as OpportunityStatus).finally(() => setSelectedStatus(null));
            }}
            disabled={updating}
          >
            <SelectTrigger aria-label={`Change status for ${opportunity.title}`} className="h-9 w-full bg-background text-xs sm:w-36">
              {updating && <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{opportunityStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          {url && <Button type="button" variant="outline" size="sm" render={<a href={url} target="_blank" rel="noreferrer" />} className="gap-1.5"><ArrowUpRight className="size-3.5" aria-hidden="true" />Application</Button>}
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
