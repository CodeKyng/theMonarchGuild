import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, ArrowUpRight, Lightbulb, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminProject } from "@/components/admin/projects/types";
import { projectStatuses } from "@/components/admin/projects/types";
import ProjectDetailsDialog from "@/components/member/projects/ProjectDetailsDialog";
import ProjectsFilters from "@/components/member/projects/ProjectsFilters";
import ProjectsGrid from "@/components/member/projects/ProjectsGrid";
import ProjectsHeader from "@/components/member/projects/ProjectsHeader";
import ProjectsSummary from "@/components/member/projects/ProjectsSummary";
import { db } from "@/firebase";

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function fromDocument(id: string, data: Record<string, unknown>): AdminProject {
  const rawStatus = text(data.status);
  return { id, title: text(data.title) || text(data.name) || "Guild project", description: text(data.description) || text(data.summary), owner: text(data.owner) || text(data.ownerName), category: text(data.category), skills: Array.isArray(data.skills) ? data.skills.filter((item): item is string => typeof item === "string").join(", ") : text(data.skills), status: projectStatuses.find((item) => item === rawStatus) ?? "Planning", projectUrl: text(data.projectUrl) || text(data.url), createdAt: readDate(data.createdAt) };
}

export default function MemberProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => onSnapshot(collection(db, "projects"), (snapshot) => {
    const rows = snapshot.docs.map((entry) => fromDocument(entry.id, entry.data()));
    rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    setProjects(rows);
    setError("");
    setLoading(false);
  }, (loadError) => {
    console.error("Failed to load member projects:", loadError);
    setError("Guild projects could not be loaded. Check your connection and try again.");
    setLoading(false);
  }), [retryToken]);

  const categories = useMemo(() => [...new Set(projects.map((project) => project.category.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [projects]);
  const filteredProjects = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return projects.filter((project) => {
      const searchable = [project.title, project.description, project.owner, project.category, project.skills].join(" ").toLocaleLowerCase();
      return (!needle || searchable.includes(needle)) && (status === "all" || project.status === status) && (category === "all" || project.category === category);
    });
  }, [category, projects, search, status]);

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6"><ProjectsHeader /><ProjectsSummary projects={projects} />{error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" /><p className="text-sm leading-5 text-destructive">{error}</p></div><button type="button" onClick={() => { setLoading(true); setError(""); setRetryToken((value) => value + 1); }} className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"><RefreshCw className="size-4" aria-hidden="true" />Try again</button></div>}<ProjectsFilters search={search} status={status} category={category} categories={categories} onSearch={setSearch} onStatus={setStatus} onCategory={setCategory} /><ProjectsGrid projects={filteredProjects} loading={loading} hasFilters={Boolean(search.trim()) || status !== "all" || category !== "all"} onView={setSelectedProject} /><section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Lightbulb className="size-4" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Ready to join a team?</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Make your skills visible and connect with builders across the Guild.</p></div></div><Link to="/member/profile" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline">Update your profile<ArrowUpRight className="size-4" aria-hidden="true" /></Link></section><ProjectDetailsDialog project={selectedProject} onClose={() => setSelectedProject(null)} /></main>;
}
