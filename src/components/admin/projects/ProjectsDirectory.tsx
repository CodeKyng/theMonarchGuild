import { FolderKanban } from "lucide-react";

import ProjectCard from "@/components/admin/projects/ProjectCard";
import ProjectFilters from "@/components/admin/projects/ProjectFilters";
import type { AdminProject, ProjectStatus } from "@/components/admin/projects/types";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsDirectory({
  projects,
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
  onProjectStatusChange,
}: {
  projects: AdminProject[];
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
  onProjectStatusChange: (projectId: string, status: ProjectStatus) => Promise<void>;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <ProjectFilters
          search={search}
          status={status}
          category={category}
          categories={categories}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onCategoryChange={onCategoryChange}
        />

        {loading && projects.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading projects">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : projects.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                updating={updatingId === project.id}
                error={updateErrors[project.id] ?? ""}
                onStatusChange={onProjectStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
            <FolderKanban className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">No projects match these filters</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Try another search or status. Create a project to invite members to build, learn, and contribute together.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
