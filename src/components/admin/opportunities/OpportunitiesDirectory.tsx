import { BriefcaseBusiness } from "lucide-react";

import OpportunityCard from "@/components/admin/opportunities/OpportunityCard";
import OpportunityFilters from "@/components/admin/opportunities/OpportunityFilters";
import type { AdminOpportunity, OpportunityStatus } from "@/components/admin/opportunities/types";
import { Card, CardContent } from "@/components/ui/card";

export default function OpportunitiesDirectory({
  opportunities,
  loading,
  search,
  status,
  type,
  updatingId,
  updateErrors,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onOpportunityStatusChange,
}: {
  opportunities: AdminOpportunity[];
  loading: boolean;
  search: string;
  status: string;
  type: string;
  updatingId: string;
  updateErrors: Record<string, string>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onOpportunityStatusChange: (id: string, status: OpportunityStatus) => Promise<void>;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <OpportunityFilters search={search} status={status} type={type} onSearchChange={onSearchChange} onStatusChange={onStatusChange} onTypeChange={onTypeChange} />

        {loading && opportunities.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading opportunities">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-96 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : opportunities.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                updating={updatingId === opportunity.id}
                error={updateErrors[opportunity.id] ?? ""}
                onStatusChange={onOpportunityStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
            <BriefcaseBusiness className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">No opportunities match this view</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Try another search or filter. Add a job or gig to help guild members find ways to learn, contribute, and earn.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
