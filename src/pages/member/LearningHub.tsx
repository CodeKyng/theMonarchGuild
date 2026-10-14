import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { AlertCircle, ArrowUpRight, BookOpenCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { LearningResource } from "@/components/admin/learning-management/types";
import { learningFormats, learningLevels } from "@/components/admin/learning-management/types";
import LearningHubFilters from "@/components/member/learning-hub/LearningHubFilters";
import LearningHubHeader from "@/components/member/learning-hub/LearningHubHeader";
import LearningHubSummary from "@/components/member/learning-hub/LearningHubSummary";
import LearningResourceDetailsDialog from "@/components/member/learning-hub/LearningResourceDetailsDialog";
import LearningResourcesGrid from "@/components/member/learning-hub/LearningResourcesGrid";
import { db } from "@/firebase";

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function fromDocument(id: string, data: Record<string, unknown>): LearningResource {
  return { id, title: text(data.title) || "Guild learning resource", summary: text(data.summary) || text(data.description), instructor: text(data.instructor) || text(data.publisher), category: text(data.category) || text(data.topic), format: learningFormats.find((item) => item === data.format) ?? "Resource", level: learningLevels.find((item) => item === data.level) ?? "All levels", duration: text(data.duration), skills: Array.isArray(data.skills) ? data.skills.filter((item): item is string => typeof item === "string").join(", ") : text(data.skills), resourceUrl: text(data.resourceUrl) || text(data.url), status: data.status === "Published" ? "Published" : "Draft", createdAt: readDate(data.createdAt) };
}

export default function MemberLearningHub() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [level, setLevel] = useState("all");
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => onSnapshot(query(collection(db, "learningCourses"), where("status", "==", "Published")), (snapshot) => {
    const published = snapshot.docs.map((entry) => fromDocument(entry.id, entry.data())).filter((resource) => resource.status === "Published");
    published.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    setResources(published);
    setError("");
    setLoading(false);
  }, (loadError) => {
    console.error("Failed to load member learning hub:", loadError);
    setError("The learning library could not be loaded. Check your connection and try again.");
    setLoading(false);
  }), [retryToken]);

  const categories = useMemo(() => [...new Set(resources.map((resource) => resource.category.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [resources]);
  const filteredResources = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return resources.filter((resource) => {
      const searchable = [resource.title, resource.summary, resource.instructor, resource.category, resource.skills].join(" ").toLocaleLowerCase();
      return (!needle || searchable.includes(needle)) && (category === "all" || resource.category === category) && (format === "all" || resource.format === format) && (level === "all" || resource.level === level);
    });
  }, [category, format, level, resources, search]);

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6"><LearningHubHeader /><LearningHubSummary resources={resources} />{error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" /><p className="text-sm leading-5 text-destructive">{error}</p></div><button type="button" onClick={() => { setLoading(true); setError(""); setRetryToken((value) => value + 1); }} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"><RefreshCw className="size-4" aria-hidden="true" />Try again</button></div>}<LearningHubFilters search={search} category={category} format={format} level={level} categories={categories} onSearch={setSearch} onCategory={setCategory} onFormat={setFormat} onLevel={setLevel} /><LearningResourcesGrid resources={filteredResources} loading={loading} hasFilters={Boolean(search.trim()) || category !== "all" || format !== "all" || level !== "all"} onView={setSelectedResource} /><section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpenCheck className="size-4" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Turn learning into momentum</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Practice a new skill in a project and share your progress with the guild.</p></div></div><Link to="/member/projects" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline">Explore projects<ArrowUpRight className="size-4" aria-hidden="true" /></Link></section><LearningResourceDetailsDialog resource={selectedResource} onClose={() => setSelectedResource(null)} /></main>;
}
