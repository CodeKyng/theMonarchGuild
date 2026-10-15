import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportPriorities, supportStatuses } from "@/components/admin/support/types";

export default function StaffSupportFilters({
  search,
  status,
  priority,
  onSearch,
  onStatus,
  onPriority,
}: {
  search: string;
  status: string;
  priority: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onPriority: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="font-semibold">Member requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search messages and triage requests by status or priority.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_10rem_10rem] lg:min-w-[31rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search support requests…"
            aria-label="Search support requests"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => onStatus(value ?? "all")}>
          <SelectTrigger aria-label="Filter requests by status" className="bg-background">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {supportStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(value) => onPriority(value ?? "all")}>
          <SelectTrigger aria-label="Filter requests by priority" className="bg-background">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {supportPriorities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
