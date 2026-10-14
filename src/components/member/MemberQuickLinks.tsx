import { ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, Compass, FolderKanban, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const destinations = [
  { title: "Community", text: "Share ideas and keep up with the guild.", to: "/member/community", icon: Compass },
  { title: "Projects", text: "Find a team and contribute your skills.", to: "/member/projects", icon: FolderKanban },
  { title: "Opportunities", text: "Explore Web3 jobs and collaborations.", to: "/member/opportunities", icon: BriefcaseBusiness },
  { title: "Learning Hub", text: "Build practical skills for your next step.", to: "/member/learning-hub", icon: BookOpen },
  { title: "Events", text: "Meet people and learn together.", to: "/member/events", icon: CalendarDays },
  { title: "Leaderboard", text: "See how guild contributions are recognized.", to: "/member/leaderboard", icon: Trophy },
];
export default function MemberQuickLinks() {
  return <Card className="border-border/70 shadow-sm"><CardHeader><CardTitle>Find your next step</CardTitle><p className="text-sm text-muted-foreground">Ways to connect, contribute, and grow in the guild.</p></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{destinations.map(({ title, text, to, icon: Icon }) => <Link key={to} to={to} className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:bg-muted/50"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span></span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" /></Link>)}</CardContent></Card>;
}
