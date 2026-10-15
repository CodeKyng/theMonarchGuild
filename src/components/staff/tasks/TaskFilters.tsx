import { ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { staffTaskPriorities, staffTaskStatuses } from "./types";

export default function TaskFilters({ search, status, priority, onSearch, onStatus, onPriority, onReset }: {
  search: string; status: string; priority: string;
  onSearch: (value: string) => void; onStatus: (value: string) => void; onPriority: (value: string) => void; onReset: () => void;
}) {
  const filtered = Boolean(search || status !== "all" || priority !== "all");
  return <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
    <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search tasks, details, or category" aria-label="Search assigned tasks" className="bg-background pl-9" /></div>
    <div className="flex flex-col gap-2 sm:flex-row"><Select value={status} onValueChange={(value) => onStatus(value ?? "all")}><SelectTrigger className="w-full bg-background sm:w-40" aria-label="Filter tasks by status"><ListFilter className="size-4 text-muted-foreground" /><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{staffTaskStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={priority} onValueChange={(value) => onPriority(value ?? "all")}><SelectTrigger className="w-full bg-background sm:w-40" aria-label="Filter tasks by priority"><SelectValue placeholder="All priorities" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{staffTaskPriorities.map((item) => <SelectItem key={item} value={item}>{item} priority</SelectItem>)}</SelectContent></Select>{filtered && <Button type="button" variant="ghost" onClick={onReset} className="shrink-0"><X className="size-4" aria-hidden="true" />Clear filters</Button>}</div>
  </div>;
}
