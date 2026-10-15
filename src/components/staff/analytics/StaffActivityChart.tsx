import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffActivityPoint } from "@/components/staff/analytics/types";

export default function StaffActivityChart({
  points,
  loading,
}: {
  points: StaffActivityPoint[];
  loading: boolean;
}) {
  const max = Math.max(1, ...points.flatMap((point) => [point.posts, point.events]));
  const hasActivity = points.some((point) => point.posts > 0 || point.events > 0);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-5 sm:p-6">
        <div>
          <CardTitle className="text-base">Community activity</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            New posts and scheduled events over the last six months.
          </p>
        </div>
        <Activity className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        {loading ? (
          <div className="h-56 animate-pulse rounded-xl bg-muted" role="status" aria-label="Loading activity chart" />
        ) : !hasActivity ? (
          <div className="grid h-56 place-items-center rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
            No dated posts or events to chart for this period.
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-amber-500" /> Community posts
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-sky-500" /> Events
              </span>
            </div>
            <div className="grid h-56 grid-cols-6 items-end gap-2 border-b border-border px-1 sm:gap-4">
              {points.map((point) => (
                <div key={point.label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                  <div className="flex h-[82%] w-full items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-t-sm bg-amber-500 sm:w-5"
                      style={{ height: `${point.posts ? Math.max(5, (point.posts / max) * 100) : 0}%` }}
                      title={`${point.posts} posts`}
                      role="img"
                      aria-label={`${point.label}: ${point.posts} community posts`}
                    />
                    <div
                      className="w-3 rounded-t-sm bg-sky-500 sm:w-5"
                      style={{ height: `${point.events ? Math.max(5, (point.events / max) * 100) : 0}%` }}
                      title={`${point.events} events`}
                      role="img"
                      aria-label={`${point.label}: ${point.events} events`}
                    />
                  </div>
                  <span className="pb-2 text-[11px] text-muted-foreground">{point.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
