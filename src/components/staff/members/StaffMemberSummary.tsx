import { BriefcaseBusiness, Sparkles, UsersRound } from "lucide-react";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";

export default function StaffMemberSummary({ members, loading }: { members: PublicMemberProfile[]; loading: boolean }) {
  const uniqueSkills = new Set(members.flatMap((member) => member.skills.map((skill) => skill.toLowerCase()))).size;
  const workTypes = new Set(members.map((member) => member.workType).filter(Boolean)).size;
  const items = [
    { label: "Shared profiles", value: members.length, detail: "Members visible in the directory", icon: UsersRound, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "Work disciplines", value: workTypes, detail: "Different work types represented", icon: BriefcaseBusiness, color: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
    { label: "Skills in the guild", value: uniqueSkills, detail: "Unique skills listed by members", icon: Sparkles, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  ];
  return <section aria-label="Member directory summary" className="grid gap-3 sm:grid-cols-3">{items.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p><p className="truncate text-xs text-muted-foreground">{detail}</p></div></article>)}</section>;
}
