import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AlertCircle, ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import StaffActivityChart from "@/components/staff/analytics/StaffActivityChart";
import StaffAnalyticsSummary from "@/components/staff/analytics/StaffAnalyticsSummary";
import StaffQueueHealth from "@/components/staff/analytics/StaffQueueHealth";
import StaffWorkloadPanel from "@/components/staff/analytics/StaffWorkloadPanel";
import type { StaffActivityPoint, StaffAnalyticsData } from "@/components/staff/analytics/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

const emptyData: StaffAnalyticsData = {
  posts: null,
  opportunities: null,
  upcomingEvents: null,
  activity: [],
  queues: { reports: null, content: null },
  workload: null,
};

function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
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

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function createActivityPoints(now: Date): StaffActivityPoint[] {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
      posts: 0,
      events: 0,
    };
  });
}

function monthIndex(date: Date, now: Date) {
  return (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth() + 5;
}

export default function StaffAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<StaffAnalyticsData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [retryToken, setRetryToken] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(emptyData);
      setErrors(["Sign in to view staff analytics."]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors([]);
    const results = await Promise.allSettled([
      getDocs(collection(db, "communityPosts")),
      getDocs(collection(db, "opportunities")),
      getDocs(collection(db, "events")),
      getDocs(collection(db, "reports")),
      getDocs(collection(db, "contentReviews")),
      getDocs(query(collection(db, "staffTasks"), where("assignedTo", "==", user.uid))),
    ]);
    const [postsResult, opportunitiesResult, eventsResult, reportsResult, reviewsResult, tasksResult] = results;
    const nextErrors: string[] = [];
    const failures = [
      ["Community activity", postsResult],
      ["Opportunities", opportunitiesResult],
      ["Events", eventsResult],
      ["Reports", reportsResult],
      ["Content reviews", reviewsResult],
      ["Your task workload", tasksResult],
    ] as const;
    for (const [label, result] of failures) {
      if (result.status === "rejected") {
        console.error(`Failed to load staff analytics for ${label.toLowerCase()}:`, result.reason);
        nextErrors.push(label);
      }
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const points = createActivityPoints(now);

    let postCount: number | null = null;
    if (postsResult.status === "fulfilled") {
      postCount = postsResult.value.size;
      for (const post of postsResult.value.docs) {
        const createdAt = readDate(post.data().createdAt);
        const index = createdAt ? monthIndex(createdAt, now) : -1;
        if (index >= 0 && index < points.length) points[index].posts += 1;
      }
    }

    let opportunityCount: number | null = null;
    if (opportunitiesResult.status === "fulfilled") {
      opportunityCount = opportunitiesResult.value.docs.filter(
        (entry) => text(entry.data().status).toLowerCase() === "open",
      ).length;
    }

    let upcomingEventCount: number | null = null;
    if (eventsResult.status === "fulfilled") {
      const dates = eventsResult.value.docs.map((entry) => readDate(entry.data().date));
      upcomingEventCount = dates.filter((date) => date && date >= today).length;
      for (const date of dates) {
        const index = date ? monthIndex(date, now) : -1;
        if (index >= 0 && index < points.length) points[index].events += 1;
      }
    }

    const queues = {
      reports:
        reportsResult.status === "fulfilled"
          ? reportsResult.value.docs.reduce(
              (counts, entry) => {
                const status = text(entry.data().status).toLowerCase();
                if (status === "new") counts.new += 1;
                else if (status === "under review") counts.underReview += 1;
                else if (status === "resolved") counts.resolved += 1;
                else if (status === "dismissed") counts.dismissed += 1;
                return counts;
              },
              { new: 0, underReview: 0, resolved: 0, dismissed: 0 },
            )
          : null,
      content:
        reviewsResult.status === "fulfilled"
          ? reviewsResult.value.docs.reduce(
              (counts, entry) => {
                const status = text(entry.data().reviewStatus).toLowerCase();
                if (status === "needs review") counts.needsReview += 1;
                else if (status === "reviewed") counts.reviewed += 1;
                else if (status === "follow-up needed") counts.followUp += 1;
                return counts;
              },
              { needsReview: 0, reviewed: 0, followUp: 0 },
            )
          : null,
    };

    const workload =
      tasksResult.status === "fulfilled"
        ? tasksResult.value.docs.reduce(
            (counts, entry) => {
              const task = entry.data();
              const status = text(task.status).toLowerCase();
              if (status === "completed") counts.completed += 1;
              else {
                counts.assigned += 1;
                if (status === "in progress") counts.inProgress += 1;
                const dueAt = readDate(task.dueAt);
                if (dueAt && dueAt < today) counts.overdue += 1;
              }
              return counts;
            },
            { assigned: 0, inProgress: 0, completed: 0, overdue: 0 },
          )
        : null;

    setData({
      posts: postCount,
      opportunities: opportunityCount,
      upcomingEvents: upcomingEventCount,
      activity: points,
      queues,
      workload,
    });
    setErrors(nextErrors);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh, retryToken]);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 via-card to-card p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
            <ChartNoAxesCombined className="size-4" aria-hidden="true" />
            The Monarch Guild · Staff workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A practical snapshot of community activity, open work, and the queues that need attention.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRetryToken((value) => value + 1)}
          disabled={loading}
          className="shrink-0 bg-background/70"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh analytics
        </Button>
      </header>

      {errors.length > 0 && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            <p className="text-sm leading-5 text-muted-foreground">
              Some analytics could not be loaded: {errors.join(", ")}. Available metrics are still shown.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => setRetryToken((value) => value + 1)}>
            Try again
          </Button>
        </div>
      )}

      <StaffAnalyticsSummary data={data} loading={loading} />
      <StaffActivityChart points={data.activity} loading={loading} />
      <section className="grid items-start gap-5 xl:grid-cols-2" aria-label="Staff operations details">
        <StaffQueueHealth queues={data.queues} />
        <StaffWorkloadPanel workload={data.workload} />
      </section>
      <p className="text-xs leading-5 text-muted-foreground">
        Activity shows the current and previous five calendar months. Task metrics include only tasks assigned to your account.
      </p>
    </div>
  );
}
