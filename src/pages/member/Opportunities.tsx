import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, ArrowUpRight, RefreshCw, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";
import { opportunityStatuses } from "@/components/admin/opportunities/types";
import OpportunityDetailsDialog from "@/components/member/opportunities/OpportunityDetailsDialog";
import OpportunityFilters from "@/components/member/opportunities/OpportunityFilters";
import OpportunitiesGrid from "@/components/member/opportunities/OpportunitiesGrid";
import OpportunitiesHeader from "@/components/member/opportunities/OpportunitiesHeader";
import OpportunitiesSummary from "@/components/member/opportunities/OpportunitiesSummary";
import { db } from "@/firebase";

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function fromDocument(id: string, data: Record<string, unknown>): AdminOpportunity {
  const rawStatus = text(data.status);
  return { id, title: text(data.title) || "Guild opportunity", organization: text(data.organization) || text(data.company), type: text(data.type), location: text(data.location), arrangement: text(data.arrangement), compensation: text(data.compensation), description: text(data.description) || text(data.summary), skills: Array.isArray(data.skills) ? data.skills.filter((item): item is string => typeof item === "string").join(", ") : text(data.skills), applicationUrl: text(data.applicationUrl) || text(data.url), deadline: readDate(data.deadline), status: opportunityStatuses.find((item) => item === rawStatus) ?? "Open", createdAt: readDate(data.createdAt) };
}

export default function MemberOpportunities() {
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Open");
  const [type, setType] = useState("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<AdminOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => onSnapshot(collection(db, "opportunities"), (snapshot) => {
    const rows = snapshot.docs.map((entry) => fromDocument(entry.id, entry.data()));
    rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    setOpportunities(rows);
    setError("");
    setLoading(false);
  }, (loadError) => {
    console.error("Failed to load member opportunities:", loadError);
    setError("Guild opportunities could not be loaded. Check your connection and try again.");
    setLoading(false);
  }), [retryToken]);

  const filteredOpportunities = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return opportunities.filter((item) => {
      const searchable = [item.title, item.organization, item.description, item.skills, item.location, item.compensation, item.type].join(" ").toLocaleLowerCase();
      return (!needle || searchable.includes(needle)) && (status === "all" || item.status === status) && (type === "all" || item.type === type);
    });
  }, [opportunities, search, status, type]);

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6"><OpportunitiesHeader /><OpportunitiesSummary opportunities={opportunities} />{error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" /><p className="text-sm leading-5 text-destructive">{error}</p></div><button type="button" onClick={() => { setLoading(true); setError(""); setRetryToken((value) => value + 1); }} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"><RefreshCw className="size-4" aria-hidden="true" />Try again</button></div>}<OpportunityFilters search={search} status={status} type={type} onSearch={setSearch} onStatus={setStatus} onType={setType} /><OpportunitiesGrid opportunities={filteredOpportunities} loading={loading} hasFilters={Boolean(search.trim()) || status !== "Open" || type !== "all"} onView={setSelectedOpportunity} /><section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UserRoundCheck className="size-4" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Help teams find you</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Keep your skills and experience current so your Guild profile is ready when you apply.</p></div></div><Link to="/member/profile" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline">Update your profile<ArrowUpRight className="size-4" aria-hidden="true" /></Link></section><OpportunityDetailsDialog opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} /></main>;
}
