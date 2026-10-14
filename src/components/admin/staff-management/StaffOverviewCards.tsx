import { BriefcaseBusiness, CheckCheck, Clock3 } from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import type { AdminUser } from "@/components/admin/AdminUserDetails";

export default function StaffOverviewCards({ staff, loading }: { staff: AdminUser[]; loading: boolean }) {
  const completeProfiles = staff.filter((person) => person.professionalTitle && person.workType && person.skills && person.location).length;
  const joinedThisMonth = staff.filter((person) => {
    if (!person.createdAt) return false;
    const now = new Date();
    return person.createdAt.getMonth() === now.getMonth() && person.createdAt.getFullYear() === now.getFullYear();
  }).length;

  return (
    <section aria-label="Staff team summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminStatCard label="Staff members" value={staff.length} detail="Accounts with staff access" icon={BriefcaseBusiness} loading={loading && staff.length === 0} />
      <AdminStatCard label="Complete profiles" value={completeProfiles} detail="Have core role and skills details" icon={CheckCheck} loading={loading && staff.length === 0} />
      <AdminStatCard label="Joined this month" value={joinedThisMonth} detail="New staff accounts this month" icon={Clock3} loading={loading && staff.length === 0} />
    </section>
  );
}
