import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportSeverities, reportStatuses } from "@/components/admin/reports-moderation/types";

export default function ModerationFilters({
  search,
  status,
  severity,
  onSearchChange,
  onStatusChange,
  onSeverityChange,
}: {
  search: string;
  status: string;
  severity: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h2 className="font-semibold">Report queue</h2>
        <p className="mt-1 text-sm text-muted-foreground">Filter reports by status, urgency, or the people and topics involved.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_10rem_10rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search reports…" aria-label="Search reports" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(value) => onStatusChange(value ?? "all")}>
          <SelectTrigger aria-label="Filter reports by status" className="bg-background"><SlidersHorizontal className="size-4 text-muted-foreground" /><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{reportStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={severity} onValueChange={(value) => onSeverityChange(value ?? "all")}>
          <SelectTrigger aria-label="Filter reports by severity" className="bg-background"><SelectValue placeholder="All priorities" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All priorities</SelectItem>{reportSeverities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}
