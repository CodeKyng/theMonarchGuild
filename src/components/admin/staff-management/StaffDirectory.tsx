import { Search, UsersRound } from "lucide-react";

import type { AdminUser } from "@/components/admin/AdminUserDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StaffMemberCard from "@/components/admin/staff-management/StaffMemberCard";

interface StaffDirectoryProps {
  staff: AdminUser[];
  loading: boolean;
  search: string;
  workType: string;
  onSearchChange: (value: string) => void;
  onWorkTypeChange: (value: string) => void;
  onViewProfile: (person: AdminUser) => void;
}

export default function StaffDirectory({
  staff,
  loading,
  search,
  workType,
  onSearchChange,
  onWorkTypeChange,
  onViewProfile,
}: StaffDirectoryProps) {
  const workTypes = [...new Set(staff.map((person) => person.workType.trim()).filter(Boolean))].sort();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><UsersRound className="size-4 text-primary" />Staff directory</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{staff.length} {staff.length === 1 ? "person" : "people"} shown</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search staff…" aria-label="Search staff by name, role, or skill" className="pl-9" />
          </div>
          <Select value={workType} onValueChange={(value) => onWorkTypeChange(value ?? "all")}>
            <SelectTrigger className="w-full bg-background sm:w-48" aria-label="Filter staff by work type"><SelectValue placeholder="All work types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All work types</SelectItem>
              {workTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading && staff.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading staff">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : staff.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {staff.map((person) => <StaffMemberCard key={person.id} person={person} onView={onViewProfile} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
            <UsersRound className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">No staff match this view</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Try a different search or work type. To add someone to the team, open their profile from Members and assign the Staff role.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
