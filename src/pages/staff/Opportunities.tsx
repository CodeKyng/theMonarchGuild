import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, BriefcaseBusiness, RefreshCw } from "lucide-react";
import OpportunityDetailsDialog from "@/components/member/opportunities/OpportunityDetailsDialog";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";
import { opportunityStatuses } from "@/components/admin/opportunities/types";
import StaffOpportunityDeadlinePanel from "@/components/staff/opportunities/StaffOpportunityDeadlinePanel";
import StaffOpportunityDirectory from "@/components/staff/opportunities/StaffOpportunityDirectory";
import StaffOpportunitySummary from "@/components/staff/opportunities/StaffOpportunitySummary";
import StaffOpportunityTypeBreakdown from "@/components/staff/opportunities/StaffOpportunityTypeBreakdown";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date =
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function opportunityFromDocument(id: string, data: Record<string, unknown>): AdminOpportunity {
  const rawStatus = text(data.status);
  return {
    id,
    title: text(data.title).trim() || "Guild opportunity",
    organization: text(data.organization) || text(data.company),
    type: text(data.type),
    location: text(data.location),
    arrangement: text(data.arrangement),
    compensation: text(data.compensation),
    description: text(data.description) || text(data.summary),
    skills: Array.isArray(data.skills)
      ? data.skills.filter((skill): skill is string => typeof skill === "string").join(", ")
      : text(data.skills),
    applicationUrl: text(data.applicationUrl) || text(data.url),
    deadline: readDate(data.deadline),
    status: opportunityStatuses.find((status) => status === rawStatus) ?? "Open",
    createdAt: readDate(data.createdAt),
  };
}

export default function StaffOpportunities() {
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Open");
  const [type, setType] = useState("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<AdminOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(
    () =>
      onSnapshot(
        collection(db, "opportunities"),
        (snapshot) => {
          const rows = snapshot.docs.map((entry) =>
            opportunityFromDocument(entry.id, entry.data()),
          );
          rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
          setOpportunities(rows);
          setError("");
          setLoading(false);
        },
        (loadError) => {
          console.error("Failed to load staff opportunities:", loadError);
          setError("Guild opportunities could not be loaded. Check your connection and try again.");
          setLoading(false);
        },
      ),
    [retryToken],
  );

  const filteredOpportunities = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return opportunities.filter((opportunity) => {
      const searchable = [
        opportunity.title,
        opportunity.organization,
        opportunity.description,
        opportunity.skills,
        opportunity.location,
        opportunity.compensation,
        opportunity.type,
        opportunity.arrangement,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (!needle || searchable.includes(needle)) &&
        (status === "all" || opportunity.status === status) &&
        (type === "all" || opportunity.type === type)
      );
    });
  }, [opportunities, search, status, type]);

  function clearFilters() {
    setSearch("");
    setStatus("Open");
    setType("all");
  }

  function refresh() {
    setLoading(true);
    setError("");
    setRetryToken((value) => value + 1);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 via-card to-card p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            The Monarch Guild · Staff workspace
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            <BriefcaseBusiness className="size-7 text-primary" aria-hidden="true" />
            Opportunities
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep an eye on roles, grants, and gigs members can explore next.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={refresh} disabled={loading} className="shrink-0 bg-background/70">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh listings
        </Button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm leading-5 text-destructive">{error}</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      <StaffOpportunitySummary opportunities={opportunities} loading={loading} />

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Opportunity insights">
        <StaffOpportunityDeadlinePanel
          opportunities={opportunities}
          onView={setSelectedOpportunity}
        />
        <StaffOpportunityTypeBreakdown opportunities={opportunities} />
      </section>

      <StaffOpportunityDirectory
        opportunities={filteredOpportunities}
        allOpportunities={opportunities}
        loading={loading}
        search={search}
        status={status}
        type={type}
        onSearch={setSearch}
        onStatus={setStatus}
        onType={setType}
        onClear={clearFilters}
        onView={setSelectedOpportunity}
      />

      <OpportunityDetailsDialog
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </div>
  );
}
