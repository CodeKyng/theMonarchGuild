import { BriefcaseBusiness, CalendarClock, CircleCheck } from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";

export default function OpportunitySummary({ opportunities, loading }: { opportunities: AdminOpportunity[]; loading: boolean }) {
  const openCount = opportunities.filter((item) => item.status === "Open" || item.status === "Reviewing").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const closingSoon = opportunities.filter((item) => item.status === "Open" && item.deadline && item.deadline >= today && item.deadline <= soon).length;

  return (
    <section aria-label="Opportunity summary" className="grid gap-4 sm:grid-cols-3">
      <AdminStatCard label="Total opportunities" value={opportunities.length} detail="Jobs, gigs, and grants listed" icon={BriefcaseBusiness} loading={loading && opportunities.length === 0} />
      <AdminStatCard label="Open listings" value={openCount} detail="Open or under review" icon={CircleCheck} loading={loading && opportunities.length === 0} />
      <AdminStatCard label="Closing soon" value={closingSoon} detail="Open listings due in 7 days" icon={CalendarClock} loading={loading && opportunities.length === 0} />
    </section>
  );
}
