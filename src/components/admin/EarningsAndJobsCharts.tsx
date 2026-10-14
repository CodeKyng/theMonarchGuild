import { BriefcaseBusiness, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CurrencyEarnings {
  currency: string;
  total: number;
  monthly: number[];
}

export interface JobAcquisitionAnalytics {
  total: number;
  uniqueUsers: number;
  monthly: number[];
}

export interface AnalyticsMonth {
  label: string;
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(amount)} ${currency}`;
  }
}

function EarningsChart({
  earnings,
  months,
}: {
  earnings: CurrencyEarnings[];
  months: AnalyticsMonth[];
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base">Total earnings by currency</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Lifetime totals with a six-month monthly trend.</p>
        </div>
        <Coins className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-5 p-5 pt-1 sm:p-6 sm:pt-1">
        {earnings.length === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border px-5 text-center">
            <div>
              <Coins className="mx-auto size-7 text-muted-foreground/60" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground">No earnings recorded</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Earnings will appear here when records are added to the earnings collection.</p>
            </div>
          </div>
        ) : (
          earnings.map((item) => {
            const max = Math.max(1, ...item.monthly);
            return (
              <div key={item.currency} className="rounded-xl border border-border bg-background p-4">
                <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.currency}</span>
                  <span className="min-w-0 break-all text-base font-semibold tabular-nums text-foreground sm:text-lg">{formatAmount(item.total, item.currency)}</span>
                </div>
                <div className="mt-4 flex h-20 items-end gap-2" role="img" aria-label={`${item.currency} earnings by month over the last six months`}>
                  {item.monthly.map((amount, index) => (
                    <div key={`${item.currency}-${months[index]?.label}`} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1 text-center">
                      <div
                        title={`${months[index]?.label}: ${formatAmount(amount, item.currency)}`}
                        className="mx-auto w-full max-w-10 rounded-t-md bg-emerald-500/80 transition-colors hover:bg-emerald-400"
                        style={{ height: `${amount === 0 ? 3 : Math.max(7, (amount / max) * 100)}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{months[index]?.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function JobsAcquiredChart({
  jobs,
  months,
}: {
  jobs: JobAcquisitionAnalytics;
  months: AnalyticsMonth[];
}) {
  const max = Math.max(1, ...jobs.monthly);
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base">Jobs acquired by users</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Recorded job acquisitions over the last six months.</p>
        </div>
        <BriefcaseBusiness className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-5 pt-1 sm:p-6 sm:pt-1">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/55 p-3">
            <p className="text-xs text-muted-foreground">Total acquired</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{jobs.total}</p>
          </div>
          <div className="rounded-xl bg-muted/55 p-3">
            <p className="text-xs text-muted-foreground">Users with acquisitions</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{jobs.uniqueUsers}</p>
          </div>
        </div>
        {jobs.total === 0 ? (
          <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-border px-5 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">No job acquisitions recorded</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Acquisitions will appear here when records are added to the jobAcquisitions collection.</p>
            </div>
          </div>
        ) : (
          <div className="flex h-36 items-end gap-2 rounded-xl border border-border p-4" role="img" aria-label="Jobs acquired per month over the last six months">
            {jobs.monthly.map((count, index) => (
              <div key={months[index]?.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1 text-center">
                <span className="text-[10px] tabular-nums text-muted-foreground">{count || ""}</span>
                <div
                  title={`${months[index]?.label}: ${count} ${count === 1 ? "job" : "jobs"}`}
                  className="mx-auto w-full max-w-10 rounded-t-md bg-violet-500/80 transition-colors hover:bg-violet-400"
                  style={{ height: `${count === 0 ? 3 : Math.max(7, (count / max) * 78)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{months[index]?.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EarningsAndJobsCharts({
  earnings,
  jobs,
  months,
}: {
  earnings: CurrencyEarnings[];
  jobs: JobAcquisitionAnalytics;
  months: AnalyticsMonth[];
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-2" aria-label="Earnings and job acquisition analytics">
      <EarningsChart earnings={earnings} months={months} />
      <JobsAcquiredChart jobs={jobs} months={months} />
    </section>
  );
}
