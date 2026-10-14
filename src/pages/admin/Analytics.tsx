import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { Activity, BriefcaseBusiness, CalendarClock, CalendarDays, RefreshCw, UsersRound } from "lucide-react";

import { db } from "@/firebase";
import AdminStatCard from "@/components/admin/AdminStatCard";
import EarningsAndJobsCharts, {
  type CurrencyEarnings,
  type JobAcquisitionAnalytics,
} from "@/components/admin/EarningsAndJobsCharts";
import {
  AdminAnalyticsCharts,
  type MonthlyPoint,
  type RoleCount,
} from "@/components/admin/AdminAnalyticsCharts";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalAccounts: number;
  members: number;
  staff: number;
  admins: number;
  events: number;
  upcomingEvents: number;
  monthly: MonthlyPoint[];
  earnings: CurrencyEarnings[];
  jobs: JobAcquisitionAnalytics;
}

function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const parsed = value.toDate();
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }
  return null;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function createMonthlyPoints(now: Date): MonthlyPoint[] {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
      accounts: 0,
      events: 0,
    };
  });
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const usersRef = collection(db, "users");
      const eventsRef = collection(db, "events");
      const earningsRef = collection(db, "earnings");
      const jobAcquisitionsRef = collection(db, "jobAcquisitions");

      const [totalCount, memberCount, staffCount, adminCount, eventsCount, userSnapshot, eventSnapshot, earningsSnapshot, acquisitionsSnapshot] = await Promise.all([
        getCountFromServer(usersRef),
        getCountFromServer(query(usersRef, where("role", "==", "member"))),
        getCountFromServer(query(usersRef, where("role", "==", "staff"))),
        getCountFromServer(query(usersRef, where("role", "==", "admin"))),
        getCountFromServer(eventsRef),
        getDocs(query(usersRef, where("createdAt", ">=", Timestamp.fromDate(start)))),
        getDocs(eventsRef),
        getDocs(earningsRef),
        getDocs(jobAcquisitionsRef),
      ]);

      const monthly = createMonthlyPoints(now);
      const pointByMonth = new Map<string, MonthlyPoint>();
      for (let index = 0; index < 6; index += 1) {
        const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        pointByMonth.set(monthKey(month), monthly[index]);
      }

      for (const userDoc of userSnapshot.docs) {
        const createdAt = readDate(userDoc.data().createdAt);
        if (!createdAt) continue;
        const point = pointByMonth.get(monthKey(createdAt));
        if (point) point.accounts += 1;
      }

      const events = eventSnapshot.docs.map((eventDoc) => readDate(eventDoc.data().date));
      let upcomingEvents = 0;
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextThirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      nextThirtyDays.setHours(23, 59, 59, 999);
      for (const date of events) {
        if (!date) continue;
        if (date >= today && date <= nextThirtyDays) upcomingEvents += 1;
        const point = pointByMonth.get(monthKey(date));
        if (point) point.events += 1;
      }

      const earningsByCurrency = new Map<string, CurrencyEarnings>();
      for (const earningDoc of earningsSnapshot.docs) {
        const earning = earningDoc.data();
        const amount = earning.amount;
        const currency = typeof earning.currency === "string" ? earning.currency.trim().toUpperCase() : "";
        if (
          !currency ||
          typeof amount !== "number" ||
          !Number.isFinite(amount) ||
          amount < 0 ||
          typeof earning.userId !== "string" ||
          !earning.userId.trim()
        ) continue;

        let summary = earningsByCurrency.get(currency);
        if (!summary) {
          summary = { currency, total: 0, monthly: Array(6).fill(0) as number[] };
          earningsByCurrency.set(currency, summary);
        }
        summary.total += amount;

        const earnedAt = readDate(earning.earnedAt);
        if (earnedAt) {
          const point = pointByMonth.get(monthKey(earnedAt));
          if (point) {
            const monthIndex = monthly.indexOf(point);
            summary.monthly[monthIndex] += amount;
          }
        }
      }

      const acquiredUserIds = new Set<string>();
      const jobMonthly = Array(6).fill(0) as number[];
      let totalAcquiredJobs = 0;
      for (const acquisitionDoc of acquisitionsSnapshot.docs) {
        const acquisition = acquisitionDoc.data();
        if (typeof acquisition.userId !== "string" || !acquisition.userId.trim()) continue;
        if (typeof acquisition.jobId !== "string" || !acquisition.jobId.trim()) continue;

        totalAcquiredJobs += 1;
        acquiredUserIds.add(acquisition.userId);
        const acquiredAt = readDate(acquisition.acquiredAt);
        if (acquiredAt) {
          const point = pointByMonth.get(monthKey(acquiredAt));
          if (point) jobMonthly[monthly.indexOf(point)] += 1;
        }
      }

      setData({
        totalAccounts: totalCount.data().count,
        members: memberCount.data().count,
        staff: staffCount.data().count,
        admins: adminCount.data().count,
        events: eventsCount.data().count,
        upcomingEvents,
        monthly,
        earnings: [...earningsByCurrency.values()].sort((a, b) => a.currency.localeCompare(b.currency)),
        jobs: {
          total: totalAcquiredJobs,
          uniqueUsers: acquiredUserIds.size,
          monthly: jobMonthly,
        },
      });
    } catch (loadError) {
      console.error("Failed to load admin analytics:", loadError);
      setError("Analytics data could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const roles = useMemo<RoleCount[]>(() => {
    if (!data) return [];
    const unassigned = Math.max(0, data.totalAccounts - data.members - data.staff - data.admins);
    return [
      { label: "Members", count: data.members, color: "bg-amber-500" },
      { label: "Staff", count: data.staff, color: "bg-sky-500" },
      { label: "Admins", count: data.admins, color: "bg-violet-500" },
      ...(unassigned > 0 ? [{ label: "Other / unassigned", count: unassigned, color: "bg-slate-400" }] : []),
    ];
  }, [data]);

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Track account growth, guild roles, and scheduled events using the data saved by the app.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh analytics
        </Button>
      </section>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button>
        </div>
      )}

      <section aria-label="Analytics summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Total accounts" value={data?.totalAccounts ?? null} detail="All registered accounts" icon={UsersRound} loading={loading && !data} />
        <AdminStatCard label="New this month" value={data?.monthly.at(-1)?.accounts ?? null} detail="Accounts with a creation date this month" icon={Activity} loading={loading && !data} />
        <AdminStatCard label="Guild events" value={data?.events ?? null} detail="Events saved in the calendar" icon={CalendarDays} loading={loading && !data} />
        <AdminStatCard label="Next 30 days" value={data?.upcomingEvents ?? null} detail="Events with a scheduled date" icon={CalendarClock} loading={loading && !data} />
        <AdminStatCard label="Jobs acquired" value={data?.jobs.total ?? null} detail="Recorded user job acquisitions" icon={BriefcaseBusiness} loading={loading && !data} />
      </section>

      {data && <AdminAnalyticsCharts monthly={data.monthly} roles={roles} totalAccounts={data.totalAccounts} />}
      {data && <EarningsAndJobsCharts earnings={data.earnings} jobs={data.jobs} months={data.monthly} />}

      <p className="text-xs leading-5 text-muted-foreground">
        Account growth uses profile <code className="rounded bg-muted px-1 py-0.5">createdAt</code>. Earnings records use numeric <code className="rounded bg-muted px-1 py-0.5">amount</code>, <code className="rounded bg-muted px-1 py-0.5">currency</code>, <code className="rounded bg-muted px-1 py-0.5">earnedAt</code>, and <code className="rounded bg-muted px-1 py-0.5">userId</code> in <code className="rounded bg-muted px-1 py-0.5">earnings</code>. Job acquisitions use <code className="rounded bg-muted px-1 py-0.5">userId</code>, <code className="rounded bg-muted px-1 py-0.5">jobId</code>, and <code className="rounded bg-muted px-1 py-0.5">acquiredAt</code> in <code className="rounded bg-muted px-1 py-0.5">jobAcquisitions</code>. Currency amounts are not converted or combined.
      </p>
    </div>
  );
}
