import { BookOpenCheck } from "lucide-react";

import LearningFilters from "@/components/admin/learning-management/LearningFilters";
import LearningResourceCard from "@/components/admin/learning-management/LearningResourceCard";
import type { LearningResource, LearningStatus } from "@/components/admin/learning-management/types";
import { Card, CardContent } from "@/components/ui/card";

export default function LearningDirectory({
  resources,
  loading,
  search,
  status,
  category,
  categories,
  updatingId,
  updateErrors,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onResourceStatusChange,
}: {
  resources: LearningResource[];
  loading: boolean;
  search: string;
  status: string;
  category: string;
  categories: string[];
  updatingId: string;
  updateErrors: Record<string, string>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onResourceStatusChange: (id: string, status: LearningStatus) => Promise<void>;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <LearningFilters search={search} status={status} category={category} categories={categories} onSearchChange={onSearchChange} onStatusChange={onStatusChange} onCategoryChange={onCategoryChange} />

        {loading && resources.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading learning catalog">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : resources.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => <LearningResourceCard key={resource.id} resource={resource} updating={updatingId === resource.id} error={updateErrors[resource.id] ?? ""} onStatusChange={onResourceStatusChange} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
            <BookOpenCheck className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">No learning resources match this view</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Try another search or filter. Add a resource to give members a practical way to build skills for Web3 work.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
