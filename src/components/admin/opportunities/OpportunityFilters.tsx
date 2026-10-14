import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { opportunityStatuses, opportunityTypes } from "@/components/admin/opportunities/types";

export default function OpportunityFilters({
  search,
  status,
  type,
  onSearchChange,
  onStatusChange,
  onTypeChange,
}: {
  search: string;
  status: string;
  type: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="font-semibold">Opportunity board</h2>
        <p className="mt-1 text-sm text-muted-foreground">Search job listings and filter by status or work type.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_10rem_10rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search title, company, or skill…" aria-label="Search opportunities" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(value) => onStatusChange(value ?? "all")}>
          <SelectTrigger aria-label="Filter opportunities by status" className="bg-background"><SlidersHorizontal className="size-4 text-muted-foreground" /><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{opportunityStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={type} onValueChange={(value) => onTypeChange(value ?? "all")}>
          <SelectTrigger aria-label="Filter opportunities by type" className="bg-background"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All types</SelectItem>{opportunityTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}
