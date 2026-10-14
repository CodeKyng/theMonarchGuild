import { Download, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function StaffManagementHeader({
  loading,
  exportDisabled,
  onRefresh,
  onExport,
}: {
  loading: boolean;
  exportDisabled: boolean;
  onRefresh: () => void;
  onExport: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><ShieldCheck className="size-4" aria-hidden="true" />Guild administration</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Staff Management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Manage the people who keep The Monarch Guild running. Review staff profiles, focus areas, and workspace access.</p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onExport} disabled={exportDisabled}><Download className="size-4" aria-hidden="true" />Export team</Button>
        <Button type="button" variant="outline" onClick={onRefresh} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button>
      </div>
    </header>
  );
}
