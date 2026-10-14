import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Activity, RefreshCw } from "lucide-react";

import CommunityContentPillars from "@/components/admin/community-content/CommunityContentPillars";
import CommunityContentSnapshot from "@/components/admin/community-content/CommunityContentSnapshot";
import CommunityPublishingChecklist from "@/components/admin/community-content/CommunityPublishingChecklist";
import AdminEventsPanel, { type AdminEventRow } from "@/components/admin/AdminEventsPanel";
import AdminRecentMembers, { type AdminUserRow } from "@/components/admin/AdminRecentMembers";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sortEvents(events: AdminEventRow[]) {
  const now = Date.now();
  const rank = (event: AdminEventRow) => !event.date ? 2 : event.date.getTime() >= now ? 0 : 1;
  return [...events].sort((a, b) => {
    const rankDifference = rank(a) - rank(b);
    if (rankDifference) return rankDifference;
    if (!a.date || !b.date) return 0;
    return rank(a) === 1 ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime();
  });
}

export default function AdminCommunityContent() {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [recentMembers, setRecentMembers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const usersRef = collection(db, "users");
      const eventsRef = collection(db, "events");
      const [memberTotal, eventTotal, usersSnapshot, eventsSnapshot] = await Promise.all([
        getCountFromServer(query(usersRef, where("role", "==", "member"))),
        getCountFromServer(eventsRef),
        getDocs(query(usersRef, orderBy("createdAt", "desc"), limit(5))),
        getDocs(eventsRef),
      ]);

      const eventRows = eventsSnapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          title: stringValue(data.title).trim() || "Guild event",
          date: toDate(data.date),
          time: stringValue(data.time),
          location: stringValue(data.venue) || stringValue(data.location),
          status: stringValue(data.status),
        } satisfies AdminEventRow;
      });
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextThirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      nextThirtyDays.setHours(23, 59, 59, 999);
      const upcoming = eventRows.filter((event) => event.date && event.date >= today && event.date <= nextThirtyDays).length;

      setMemberCount(memberTotal.data().count);
      setEventCount(eventTotal.data().count);
      setUpcomingCount(upcoming);
      setEvents(sortEvents(eventRows).slice(0, 5));
      setRecentMembers(usersSnapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          name: stringValue(data.displayName),
          email: stringValue(data.email),
          role: stringValue(data.role),
          createdAt: toDate(data.createdAt),
        } satisfies AdminUserRow;
      }));
    } catch (loadError) {
      console.error("Failed to load community content overview:", loadError);
      setError("Community information could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><Activity className="size-4" aria-hidden="true" />Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Community &amp; Content</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Create useful ways for Web3 jobbers and enthusiasts to connect, learn, contribute, and grow.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh overview
        </Button>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <CommunityContentSnapshot members={memberCount} eventCount={eventCount} upcomingEvents={upcomingCount} loading={loading} />

      <section aria-label="Community activity" className="grid min-w-0 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminEventsPanel events={events} loading={loading} onEventAdded={() => void refresh()} />
        <AdminRecentMembers members={recentMembers} loading={loading && recentMembers.length === 0} />
      </section>

      <CommunityContentPillars />

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <CommunityPublishingChecklist />
        <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 to-card p-5 sm:p-6">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">A guild that grows together</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Make every update lead somewhere.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Connect community announcements to a real next step: meet at an event, learn a skill, contribute to a project, or find work.</p>
        </div>
      </section>
    </div>
  );
}
