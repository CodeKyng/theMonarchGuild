import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectStatuses } from "@/components/admin/projects/types";

export default function ProjectFilters({
  search,
  status,
  category,
  categories,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: {
  search: string;
  status: string;
  category: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h2 className="font-semibold">Project directory</h2>
        <p className="mt-1 text-sm text-muted-foreground">Find projects by name, focus, skills, or status.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_10rem_10rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search projects…" aria-label="Search projects" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(value) => onStatusChange(value ?? "all")}>
          <SelectTrigger aria-label="Filter projects by status" className="bg-background"><SlidersHorizontal className="size-4 text-muted-foreground" /><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{projectStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={category} onValueChange={(value) => onCategoryChange(value ?? "all")}>
          <SelectTrigger aria-label="Filter projects by category" className="bg-background"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}
