import { ArrowRight, ClipboardCheck, FileSearch, Flag, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const focusItems = [
  { title: "Check assigned tasks", description: "See what the team needs you to move forward.", href: "/staff/assigned-tasks", icon: ClipboardCheck, tag: "Daily" },
  { title: "Review moderation queue", description: "Look over community items awaiting a decision.", href: "/staff/moderation-queue", icon: Flag, tag: "Community" },
  { title: "Respond to support", description: "Keep member questions and requests moving.", href: "/staff/support-inbox", icon: LifeBuoy, tag: "Members" },
  { title: "Review submitted reports", description: "Follow up on concerns raised by the community.", href: "/staff/reports", icon: FileSearch, tag: "Community" },
];

export default function StaffFocusList() {
  return <Card className="border-border/70 shadow-sm">
    <CardHeader className="pb-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Your work</p><CardTitle className="text-lg">Suggested focus</CardTitle></CardHeader>
    <CardContent className="space-y-1">
      {focusItems.map(({ title, description, href, icon: Icon, tag }) => <Link key={href} to={href} className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground"><Icon className="size-4" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-semibold">{title}<span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span></span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>)}
    </CardContent>
  </Card>;
}
