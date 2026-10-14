import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  loading = false,
}: {
  label: string;
  value: number | null;
  detail: string;
  icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-muted" aria-label={`Loading ${label.toLowerCase()}`} />
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value ?? "—"}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-300">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
