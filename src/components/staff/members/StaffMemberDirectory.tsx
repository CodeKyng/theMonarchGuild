import { SearchX, UsersRound } from "lucide-react";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import PublicMemberCard from "@/components/member/explore-members/PublicMemberCard";
import { Card, CardContent } from "@/components/ui/card";
import StaffMemberFilters from "./StaffMemberFilters";

export default function StaffMemberDirectory({ members, allMembers, workTypes, loading, search, workType, onSearch, onWorkType, onClear, onView }: {
  members: PublicMemberProfile[]; allMembers: PublicMemberProfile[]; workTypes: string[]; loading: boolean; search: string; workType: string;
  onSearch: (value: string) => void; onWorkType: (value: string) => void; onClear: () => void; onView: (member: PublicMemberProfile) => void;
}) {
  const filtered = Boolean(search.trim() || workType !== "all");
  return <Card className="border-border/70 shadow-sm"><CardContent className="space-y-5 p-4 sm:p-6"><StaffMemberFilters search={search} workType={workType} workTypes={workTypes} onSearch={onSearch} onWorkType={onWorkType} onClear={onClear} />
    {loading && allMembers.length === 0 ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading guild members">{[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted" />)}</div> : members.length ? <><p className="text-xs text-muted-foreground">Showing {members.length} of {allMembers.length} shared profiles</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{members.map((member) => <PublicMemberCard key={member.id} member={member} onView={onView} />)}</div></> : <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">{filtered ? <SearchX className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" /> : <UsersRound className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />}<h3 className="mt-3 font-semibold">{filtered ? "No members match those filters" : "No shared member profiles yet"}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{filtered ? "Try a different name, skill, work type, or location." : "Members who choose to share their professional profiles will appear here."}</p>{filtered && <button type="button" onClick={onClear} className="mt-4 text-sm font-semibold text-primary hover:underline">Clear filters</button>}</div>}
  </CardContent></Card>;
}
