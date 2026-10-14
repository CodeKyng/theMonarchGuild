import { Download, RefreshCw } from "lucide-react";

import AdminCreateLearningResourceDialog from "@/components/admin/learning-management/AdminCreateLearningResourceDialog";
import { Button } from "@/components/ui/button";

export default function LearningManagementHeader({
  loading,
  exportDisabled,
  onRefresh,
  onExport,
  onCreated,
}: {
  loading: boolean;
  exportDisabled: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onCreated: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild administration</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Learning Management</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Curate practical courses, workshops, and resources that help Web3 jobbers and enthusiasts grow their skills.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onExport} disabled={exportDisabled}><Download className="size-4" aria-hidden="true" />Export catalog</Button>
        <Button type="button" variant="outline" onClick={onRefresh} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button>
        <AdminCreateLearningResourceDialog onCreated={onCreated} />
      </div>
    </header>
  );
}
