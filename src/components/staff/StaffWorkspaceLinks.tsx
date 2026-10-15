import { ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, FileCheck2, Settings2, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { label: "Members", href: "/staff/members", icon: UsersRound },
  { label: "Content review", href: "/staff/content-review", icon: FileCheck2 },
  { label: "Opportunities", href: "/staff/opportunities", icon: BriefcaseBusiness },
  { label: "Events", href: "/staff/events", icon: CalendarDays },
  { label: "Announcements", href: "/staff/announcements", icon: Bell },
  { label: "Analytics", href: "/staff/analytics", icon: ChartNoAxesCombined },
  { label: "Settings", href: "/staff/settings", icon: Settings2 },
];

export default function StaffWorkspaceLinks() {
  return <Card className="border-border/70 shadow-sm">
    <CardHeader className="pb-3"><CardTitle className="text-base">Workspace shortcuts</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
      {links.map(({ label, href, icon: Icon }) => <Link key={href} to={href} className="group flex min-h-14 items-center gap-2.5 rounded-xl border border-border/70 px-3 py-2.5 text-sm font-medium transition-colors hover:border-amber-500/30 hover:bg-amber-400/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{label}</span><ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /></Link>)}
    </CardContent>
  </Card>;
}
