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
import { Activity, CalendarDays, RefreshCw, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import AdminEventsPanel, { type AdminEventRow } from "@/components/admin/AdminEventsPanel";
import AdminRecentMembers, { type AdminUserRow } from "@/components/admin/AdminRecentMembers";
import AdminStatCard from "@/components/admin/AdminStatCard";

interface DashboardStats {
  users: number;
  members: number;
  staff: number;
  events: number;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date =
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
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

function eventOrder(a: AdminEventRow, b: AdminEventRow) {
  const now = Date.now();
  const getRank = (date: Date | null) => !date ? 1 : date.getTime() >= now ? 0 : 2;
  const rankDifference = getRank(a.date) - getRank(b.date);
  if (rankDifference !== 0) return rankDifference;
  if (!a.date || !b.date) return 0;
  return getRank(a.date) === 2
    ? b.date.getTime() - a.date.getTime()
    : a.date.getTime() - b.date.getTime();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<AdminUserRow[]>([]);
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const usersRef = collection(db, "users");
      const eventsRef = collection(db, "events");
      const [usersCount, membersCount, staffCount, eventsCount, usersSnapshot, eventsSnapshot] = await Promise.all([
        getCountFromServer(usersRef),
        getCountFromServer(query(usersRef, where("role", "==", "member"))),
        getCountFromServer(query(usersRef, where("role", "==", "staff"))),
        getCountFromServer(eventsRef),
        getDocs(query(usersRef, orderBy("createdAt", "desc"), limit(6))),
        getDocs(query(eventsRef, orderBy("date", "asc"), limit(12))),
      ]);

      setStats({
        users: usersCount.data().count,
        members: membersCount.data().count,
        staff: staffCount.data().count,
        events: eventsCount.data().count,
      });

      setMembers(usersSnapshot.docs.map((snapshot) => {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          name: typeof data.displayName === "string" ? data.displayName : "",
          email: typeof data.email === "string" ? data.email : "",
          role: typeof data.role === "string" ? data.role : "",
          createdAt: toDate(data.createdAt),
        };
      }));

      const eventRows = eventsSnapshot.docs.map((snapshot) => {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          title: typeof data.title === "string" && data.title.trim() ? data.title : "Guild event",
          date: toDate(data.date),
          time: typeof data.time === "string" ? data.time : "",
          location: typeof data.venue === "string" ? data.venue : typeof data.location === "string" ? data.location : "",
          status: typeof data.status === "string" ? data.status : "",
        } satisfies AdminEventRow;
      });
      setEvents(eventRows.sort(eventOrder).slice(0, 5));
    } catch (loadError) {
      console.error("Failed to load admin dashboard:", loadError);
      setError("We couldn’t load guild data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refreshDashboard(), 0);
    return () => window.clearTimeout(task);
  }, [refreshDashboard]);

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A live overview of member accounts and events across The Monarch Guild.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refreshDashboard()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh data
        </Button>
      </section>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refreshDashboard()}>Try again</Button>
        </div>
      )}

      <section aria-label="Guild statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total accounts" value={stats?.users ?? null} detail="All registered guild accounts" icon={UsersRound} loading={loading && !stats} />
        <AdminStatCard label="Members" value={stats?.members ?? null} detail="Accounts with the member role" icon={Activity} loading={loading && !stats} />
        <AdminStatCard label="Staff" value={stats?.staff ?? null} detail="Accounts with the staff role" icon={ShieldCheck} loading={loading && !stats} />
        <AdminStatCard label="Guild events" value={stats?.events ?? null} detail="Events saved in the calendar" icon={CalendarDays} loading={loading && !stats} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div><AdminRecentMembers members={members} loading={loading && members.length === 0} /></div>
        <div id="guild-events"><AdminEventsPanel events={events} loading={loading && events.length === 0} onEventAdded={() => void refreshDashboard()} /></div>
      </section>

      <p className="text-xs text-muted-foreground">
        Need the public-facing view? <Link to="/" className="font-medium text-amber-700 underline-offset-4 hover:underline dark:text-amber-300">Open the guild homepage</Link>.
      </p>
    </div>
  );
}
