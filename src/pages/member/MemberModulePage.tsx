import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { memberSections } from "@/components/member/memberSections";
import MemberContentDirectory from "@/components/member/MemberContentDirectory";
import type { MemberResource } from "@/components/member/types";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { if (typeof value === "string") return value; if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").join(", "); return ""; }
function readDate(value: unknown): Date | null { if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value; if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; } if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; } return null; }
function resourceFromDocument(id: string, data: Record<string, unknown>): MemberResource {
  return { id, title: stringValue(data.title) || stringValue(data.name) || stringValue(data.subject) || "Guild update", description: stringValue(data.description) || stringValue(data.summary) || stringValue(data.content) || stringValue(data.details), category: stringValue(data.category) || stringValue(data.type) || stringValue(data.topic), owner: stringValue(data.ownerName) || stringValue(data.owner) || stringValue(data.organization) || stringValue(data.instructor) || stringValue(data.publisher) || stringValue(data.host), status: stringValue(data.status), date: readDate(data.date) || readDate(data.deadline) || readDate(data.createdAt), link: stringValue(data.projectUrl) || stringValue(data.applicationUrl) || stringValue(data.resourceUrl) || stringValue(data.url), meta: stringValue(data.skills) || stringValue(data.location) || stringValue(data.venue) || stringValue(data.format) };
}

export default function MemberModulePage() {
  const { section = "" } = useParams(); const config = memberSections[section]; const collectionName = config?.collection; const { user } = useAuth();
  const [resources, setResources] = useState<MemberResource[]>([]); const [search, setSearch] = useState(""); const [category, setCategory] = useState("all"); const [loading, setLoading] = useState(Boolean(config?.collection)); const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!collectionName) return;
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const rows = snapshot.docs.map((entry) => resourceFromDocument(entry.id, entry.data())).filter((item) => !["draft", "archived", "hidden"].includes(item.status.toLowerCase()));
      if (section === "events") {
        const now = new Date().getTime();
        rows.sort((a, b) => {
          const aTime = a.date?.getTime() ?? Number.MAX_SAFE_INTEGER; const bTime = b.date?.getTime() ?? Number.MAX_SAFE_INTEGER;
          const aPast = aTime < now; const bPast = bTime < now;
          if (aPast !== bPast) return aPast ? 1 : -1;
          return aPast ? bTime - aTime : aTime - bTime;
        });
      } else rows.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
      setResources(rows);
    } catch (loadError) { console.error(`Failed to load member ${section}:`, loadError); setError("These guild resources could not be loaded with the current account permissions. Please try again later or contact guild staff."); }
    finally { setLoading(false); }
  }, [collectionName, section]);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  const categories = useMemo(() => [...new Set(resources.map((resource) => resource.category.trim()).filter(Boolean))].sort(), [resources]);
  const filtered = useMemo(() => { const needle = search.trim().toLowerCase(); return resources.filter((resource) => (!needle || [resource.title, resource.description, resource.category, resource.owner, resource.meta].some((value) => value.toLowerCase().includes(needle))) && (category === "all" || resource.category === category)); }, [resources, search, category]);
  if (!config) return <section className="rounded-2xl border border-border bg-card p-6"><h1 className="text-2xl font-semibold">Member page not found</h1><p className="mt-2 text-sm text-muted-foreground">Choose a destination from the member workspace menu.</p></section>;
  const Icon = config.icon;
  return <div className="space-y-7"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><Icon className="size-4" aria-hidden="true" />Member workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{config.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{config.description}</p></div>{config.collection && <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button>}</header>
    {config.kind === "directory" ? <>{error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}<MemberContentDirectory resources={filtered} categories={categories} search={search} category={category} loading={loading} emptyTitle={config.emptyTitle} emptyDescription={config.emptyDescription} onSearch={setSearch} onCategory={setCategory} /></> : <section className="rounded-2xl border border-border bg-card p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span><h2 className="mt-4 text-xl font-semibold">{config.emptyTitle}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{config.emptyDescription}</p><div className="mt-5 flex flex-wrap gap-2"><Link to="/member/events" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Explore events<ArrowUpRight className="size-4" aria-hidden="true" /></Link><Link to="/member/projects" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Browse projects<ArrowUpRight className="size-4" aria-hidden="true" /></Link>{section === "explore-members" && <Link to="/member/profile" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Complete your profile<ArrowUpRight className="size-4" aria-hidden="true" /></Link>}</div><p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">Signed in as {user?.email || "guild member"}. Your personal profile remains private.</p></section>}
  </div>;
}
