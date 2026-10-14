import { Search } from "lucide-react";
import { communityCategories } from "@/components/member/community/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CommunityFeedFilters({ search, category, onSearch, onCategory }: { search: string; category: string; onSearch: (value: string) => void; onCategory: (value: string) => void }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Guild conversations</h2><p className="mt-1 text-sm text-muted-foreground">Find ideas, questions, project updates, and member wins.</p></div><div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_10rem] sm:min-w-[24rem]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search conversations…" aria-label="Search community posts" className="pl-9" /></div><Select value={category} onValueChange={(value) => onCategory(value ?? "all")}><SelectTrigger aria-label="Filter community posts by category" className="bg-background"><SelectValue placeholder="All topics" /></SelectTrigger><SelectContent><SelectItem value="all">All topics</SelectItem>{communityCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div>;
}
