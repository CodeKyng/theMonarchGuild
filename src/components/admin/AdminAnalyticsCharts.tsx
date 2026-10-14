import { BarChart3, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface MonthlyPoint {
  label: string;
  accounts: number;
  events: number;
}

export interface RoleCount {
  label: string;
  count: number;
  color: string;
}

function MonthlyActivityChart({ points }: { points: MonthlyPoint[] }) {
  const max = Math.max(1, ...points.flatMap((point) => [point.accounts, point.events]));
  const chartHeight = 180;
  const baseline = 190;
  const groupWidth = 540 / Math.max(points.length, 1);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base">Community activity</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">New accounts and scheduled events by month.</p>
        </div>
        <BarChart3 className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        {points.every((point) => point.accounts === 0 && point.events === 0) ? (
          <div className="grid h-56 place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            Not enough dated activity to chart yet.
          </div>
        ) : (
          <div>
            <div className="mb-4 flex gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-amber-500" />New accounts</span>
              <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-sky-500" />Events</span>
            </div>
            <ScrollArea orientation="horizontal" className="w-full">
              <svg viewBox="0 0 600 230" role="img" aria-label="Bar chart of new accounts and scheduled events for the last six months" className="h-56 min-w-[520px] w-full">
                {[0, 1, 2, 3].map((step) => {
                  const y = 10 + (chartHeight / 3) * step;
                  return <line key={step} x1="32" x2="590" y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="3 5" />;
                })}
                {points.map((point, index) => {
                  const centerX = 40 + index * groupWidth + groupWidth / 2;
                  const accountHeight = (point.accounts / max) * (chartHeight - 15);
                  const eventHeight = (point.events / max) * (chartHeight - 15);
                  return (
                    <g key={point.label}>
                      <rect x={centerX - 19} y={baseline - accountHeight} width="17" height={accountHeight} rx="4" className="fill-amber-500" />
                      <rect x={centerX + 3} y={baseline - eventHeight} width="17" height={eventHeight} rx="4" className="fill-sky-500" />
                      <text x={centerX} y="218" textAnchor="middle" className="fill-muted-foreground" fontSize="11">{point.label}</text>
                    </g>
                  );
                })}
              </svg>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoleDistribution({ roles, total }: { roles: RoleCount[]; total: number }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base">Account roles</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Current role distribution across accounts.</p>
        </div>
        <UsersRound className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-5 p-5 pt-1 sm:p-6 sm:pt-1">
        {roles.map((role) => {
          const percentage = total > 0 ? Math.round((role.count / total) * 100) : 0;
          return (
            <div key={role.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{role.label}</span>
                <span className="tabular-nums text-muted-foreground">{role.count} <span className="text-xs">({percentage}%)</span></span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${role.label} share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
                <div className={`h-full rounded-full ${role.color}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
        {total === 0 && <p className="text-sm text-muted-foreground">No accounts have been registered yet.</p>}
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsCharts({
  monthly,
  roles,
  totalAccounts,
}: {
  monthly: MonthlyPoint[];
  roles: RoleCount[];
  totalAccounts: number;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]" aria-label="Guild analytics charts">
      <MonthlyActivityChart points={monthly} />
      <RoleDistribution roles={roles} total={totalAccounts} />
    </section>
  );
}
