import { ArrowDownWideNarrow, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeaderboardFilters({ search, sort, onSearch, onSort }: { search: string; sort: string; onSearch: (value: string) => void; onSort: (value: string) => void }) {
  return <Card className="border-border/70 shadow-sm"><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5"><div><h2 className="font-semibold">Guild contributors</h2><p className="mt-1 text-sm text-muted-foreground">Browse members who chose to share their recognition.</p></div><div className="grid gap-2 sm:min-w-[min(100%,28rem)] sm:grid-cols-[minmax(12rem,1fr)_12rem]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search members…" aria-label="Search leaderboard members" className="pl-9" /></div><Select value={sort} onValueChange={(value) => onSort(value ?? "points")}><SelectTrigger aria-label="Sort leaderboard"><ArrowDownWideNarrow className="size-4 text-muted-foreground" aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="points">Most points</SelectItem><SelectItem value="name">Name A–Z</SelectItem></SelectContent></Select></div></CardContent></Card>;
}
