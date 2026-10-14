import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { FolderKanban, RefreshCw } from "lucide-react";

import AdminCreateProjectDialog from "@/components/admin/projects/AdminCreateProjectDialog";
import ProjectSummary from "@/components/admin/projects/ProjectSummary";
import ProjectsDirectory from "@/components/admin/projects/ProjectsDirectory";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { projectStatuses, type AdminProject, type ProjectStatus } from "@/components/admin/projects/types";

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").join(", ");
  return "";
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function projectFromDocument(id: string, data: Record<string, unknown>): AdminProject {
  const statusValue = stringValue(data.status);
  const status = projectStatuses.find((item) => item === statusValue) ?? "Planning";
  return {
    id,
    title: stringValue(data.title) || stringValue(data.name) || "Untitled project",
    description: stringValue(data.description) || stringValue(data.summary),
    owner: stringValue(data.owner) || stringValue(data.ownerName),
    category: stringValue(data.category),
    skills: stringValue(data.skills),
    status,
    projectUrl: stringValue(data.projectUrl) || stringValue(data.url),
    createdAt: toDate(data.createdAt),
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "projects"));
      const rows = snapshot.docs.map((entry) => projectFromDocument(entry.id, entry.data()));
      rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setProjects(rows);
    } catch (loadError) {
      console.error("Failed to load guild projects:", loadError);
      setError("Projects could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const categories = useMemo(() => [...new Set(projects.map((project) => project.category.trim()).filter(Boolean))].sort(), [projects]);

  const filteredProjects = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !needle || [project.title, project.description, project.owner, project.category, project.skills]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (status === "all" || project.status === status) && (category === "all" || project.category === category);
    });
  }, [category, projects, search, status]);

  async function updateProjectStatus(projectId: string, nextStatus: ProjectStatus) {
    setUpdatingId(projectId);
    setUpdateErrors((current) => ({ ...current, [projectId]: "" }));
    try {
      await updateDoc(doc(db, "projects", projectId), { status: nextStatus, updatedAt: serverTimestamp() });
      setProjects((current) => current.map((project) => project.id === projectId ? { ...project, status: nextStatus } : project));
    } catch (saveError) {
      console.error("Failed to update project status:", saveError);
      setUpdateErrors((current) => ({ ...current, [projectId]: "Status could not be updated. Check permissions and try again." }));
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><FolderKanban className="size-4" aria-hidden="true" />Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Organize guild projects, bring contributors together, and help members turn Web3 skills into visible work.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button>
          <AdminCreateProjectDialog onCreated={() => void refresh()} />
        </div>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <ProjectSummary projects={projects} loading={loading} />
      <ProjectsDirectory
        projects={filteredProjects}
        loading={loading}
        search={search}
        status={status}
        category={category}
        categories={categories}
        updatingId={updatingId}
        updateErrors={updateErrors}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onProjectStatusChange={updateProjectStatus}
      />
    </div>
  );
}
