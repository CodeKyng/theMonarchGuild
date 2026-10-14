import { CheckCircle2, FolderKanban, Rocket } from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import type { AdminProject } from "@/components/admin/projects/types";

export default function ProjectSummary({ projects, loading }: { projects: AdminProject[]; loading: boolean }) {
  const inProgress = projects.filter((project) => project.status === "In progress" || project.status === "Recruiting").length;
  const completed = projects.filter((project) => project.status === "Completed").length;

  return (
    <section aria-label="Project summary" className="grid gap-4 sm:grid-cols-3">
      <AdminStatCard label="Total projects" value={projects.length} detail="Projects in the guild workspace" icon={FolderKanban} loading={loading && projects.length === 0} />
      <AdminStatCard label="Active projects" value={inProgress} detail="Recruiting or in progress" icon={Rocket} loading={loading && projects.length === 0} />
      <AdminStatCard label="Completed" value={completed} detail="Projects marked complete" icon={CheckCircle2} loading={loading && projects.length === 0} />
    </section>
  );
}
