import { FolderSearch, SearchX } from "lucide-react";
import type { AdminProject } from "@/components/admin/projects/types";
import ProjectCard from "@/components/member/projects/ProjectCard";

export default function ProjectsGrid({ projects, loading, hasFilters, onView }: { projects: AdminProject[]; loading: boolean; hasFilters: boolean; onView: (project: AdminProject) => void }) {
  if (loading && !projects.length) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading guild projects">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-muted" />)}</div>;
  if (!projects.length) return <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">{hasFilters ? <SearchX className="size-5" aria-hidden="true" /> : <FolderSearch className="size-5" aria-hidden="true" />}</span><h3 className="mt-4 font-semibold">{hasFilters ? "No projects match those filters" : "The project board is just getting started"}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{hasFilters ? "Try a broader search or choose a different status or category." : "Guild projects will appear here as teams share work members can learn from and contribute to."}</p></div>;
  return <section aria-label="Guild projects"><p className="mb-3 text-xs text-muted-foreground">Showing {projects.length} {projects.length === 1 ? "project" : "projects"}</p><div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} onView={onView} />)}</div></section>;
}
