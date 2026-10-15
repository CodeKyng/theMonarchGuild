import { ClipboardList, type LucideIcon } from "lucide-react";
import { useParams } from "react-router-dom";

const staffPages: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  "assigned-tasks": { title: "Assigned Tasks", description: "Review work assigned to you and keep track of what needs attention.", icon: ClipboardList },
  members: { title: "Members", description: "Find member information relevant to your staff responsibilities.", icon: ClipboardList },
  "moderation-queue": { title: "Moderation Queue", description: "Review community items that need a moderation decision.", icon: ClipboardList },
  reports: { title: "Reports", description: "Review submitted reports and follow up on reported concerns.", icon: ClipboardList },
  "content-review": { title: "Content Review", description: "Review community content before it is published or promoted.", icon: ClipboardList },
  opportunities: { title: "Opportunities", description: "Review and support opportunities shared with the guild.", icon: ClipboardList },
  events: { title: "Events", description: "Coordinate guild events and keep event information current.", icon: ClipboardList },
  announcements: { title: "Announcements", description: "Prepare updates and announcements for the guild community.", icon: ClipboardList },
  "support-inbox": { title: "Support Inbox", description: "Review member questions and support requests.", icon: ClipboardList },
  analytics: { title: "Analytics", description: "View activity and operational metrics for the guild.", icon: ClipboardList },
  settings: { title: "Settings", description: "Manage your staff workspace preferences and account details.", icon: ClipboardList },
};

export default function StaffModulePage() {
  const { section = "" } = useParams();
  const page = staffPages[section];

  if (!page) return <section className="rounded-2xl border border-border bg-card p-6"><h1 className="text-2xl font-semibold">Staff page not found</h1><p className="mt-2 text-sm text-muted-foreground">Choose a section from the staff workspace menu.</p></section>;

  const Icon = page.icon;
  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">The Monarch Guild · Staff workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{page.description}</p>
      </header>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-400/15 text-amber-700 dark:text-amber-200"><Icon className="size-5" aria-hidden="true" /></div>
        <h2 className="mt-4 text-lg font-semibold">{page.title} workspace</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">This staff section is ready for its workflow and data connection.</p>
      </div>
    </section>
  );
}
