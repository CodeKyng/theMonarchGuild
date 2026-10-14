import { ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, FolderKanban, UserRoundSearch } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  { title: "Events & meetups", description: "Bring members together through talks, workshops, and community meetups.", href: "/admin/events", action: "Manage events", icon: CalendarDays },
  { title: "Member stories", description: "Surface the skills, projects, and career journeys already inside the guild.", href: "/admin/members", action: "Browse members", icon: UserRoundSearch },
  { title: "Project spotlights", description: "Help members find work to contribute to and recognize what the community builds.", href: "/admin/projects", action: "Explore projects", icon: FolderKanban },
  { title: "Learning resources", description: "Connect practical learning paths with opportunities to practice and grow.", href: "/admin/learning-management", action: "Plan learning", icon: BookOpen },
  { title: "Work opportunities", description: "Share trusted jobs and gigs that help Web3 talent earn and advance.", href: "/admin/opportunities", action: "Review opportunities", icon: BriefcaseBusiness },
];

export default function CommunityContentPillars() {
  return (
    <section aria-labelledby="community-pillars-heading" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild programming</p>
        <h2 id="community-pillars-heading" className="mt-1 text-xl font-semibold tracking-tight">What brings the community forward</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Use these areas to connect people with knowledge, meaningful work, and one another.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pillars.map(({ title, description, href, action, icon: Icon }) => (
          <Card key={title} className="group border-border/70 shadow-sm transition-colors hover:border-primary/30">
            <CardContent className="flex h-full flex-col p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
              <Link to={href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline">
                {action}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
