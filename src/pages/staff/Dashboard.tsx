import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import StaffFocusList from "@/components/staff/StaffFocusList";
import StaffOverviewCards from "@/components/staff/StaffOverviewCards";
import StaffUpcomingEvents, { type StaffEvent } from "@/components/staff/StaffUpcomingEvents";
import StaffWorkspaceLinks from "@/components/staff/StaffWorkspaceLinks";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<StaffEvent[]>([]);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [opportunityCount, setOpportunityCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    const [eventsResult, opportunitiesResult, postsResult] = await Promise.allSettled([
      getDocs(collection(db, "events")),
      getDocs(collection(db, "opportunities")),
      getDocs(collection(db, "communityPosts")),
    ]);
    let failed = false;

    if (eventsResult.status === "fulfilled") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const rows = eventsResult.value.docs.map((entry) => {
        const data = entry.data();
        return { id: entry.id, title: stringValue(data.title).trim() || "Guild event", date: readDate(data.date), time: stringValue(data.time), location: stringValue(data.venue) || stringValue(data.location) } satisfies StaffEvent;
      }).filter((event) => !event.date || event.date >= today).sort((a, b) => (a.date?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.date?.getTime() ?? Number.MAX_SAFE_INTEGER));
      setEventCount(rows.length);
      setEvents(rows.slice(0, 4));
    } else failed = true;

    if (opportunitiesResult.status === "fulfilled") {
      setOpportunityCount(opportunitiesResult.value.docs.filter((entry) => stringValue(entry.data().status).toLowerCase() === "open").length);
    } else failed = true;

    if (postsResult.status === "fulfilled") setPostCount(postsResult.value.size);
    else failed = true;

    if (failed) setError("Some overview information could not be loaded. You can still open each workspace section to continue.");
    setLoading(false);
  }, []);

  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);

  const firstName = (user?.displayName?.trim() || user?.email?.split("@")[0] || "there").split(/[\s._-]/)[0];
  const today = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 via-card to-card p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
      <div><p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200"><Sparkles className="size-4" aria-hidden="true" />Staff workspace <span className="text-muted-foreground">· {today}</span></p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {firstName}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Here’s your guild operations snapshot. Pick up a task, check what’s coming up, or jump into a workspace.</p></div>
      <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading} className="shrink-0 bg-background/70"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh overview</Button>
    </header>

    {error && <div role="status" className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}

    <StaffOverviewCards events={eventCount} opportunities={opportunityCount} posts={postCount} loading={loading} />

    <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <StaffFocusList />
      <div className="space-y-5"><StaffUpcomingEvents events={events} loading={loading} /><StaffWorkspaceLinks /></div>
    </section>

    <footer className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-muted-foreground">Need a starting point? Your assigned work and community queues are one click away.</p>
      <Link to="/staff/assigned-tasks" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Open assigned tasks<ArrowRight className="size-4" aria-hidden="true" /></Link>
    </footer>
  </div>;
}
