import { CalendarDays, CalendarRange, UsersRound } from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";

export default function CommunityContentSnapshot({
  members,
  eventCount,
  upcomingEvents,
  loading,
}: {
  members: number | null;
  eventCount: number | null;
  upcomingEvents: number | null;
  loading: boolean;
}) {
  return (
    <section aria-label="Community snapshot" className="grid gap-4 sm:grid-cols-3">
      <AdminStatCard label="Guild members" value={members} detail="Accounts with Member access" icon={UsersRound} loading={loading} />
      <AdminStatCard label="Published events" value={eventCount} detail="Events currently in the guild calendar" icon={CalendarDays} loading={loading} />
      <AdminStatCard label="Coming up" value={upcomingEvents} detail="Events scheduled in the next 30 days" icon={CalendarRange} loading={loading} />
    </section>
  );
}
