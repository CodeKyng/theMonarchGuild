import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Megaphone, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import AnnouncementComposerDialog from "@/components/staff/announcements/AnnouncementComposerDialog";
import AnnouncementDirectory from "@/components/staff/announcements/AnnouncementDirectory";
import AnnouncementPreviewDialog from "@/components/staff/announcements/AnnouncementPreviewDialog";
import AnnouncementSummary from "@/components/staff/announcements/AnnouncementSummary";
import { announcementCategories, announcementStatuses, type AnnouncementCategory, type AnnouncementStatus, type GuildAnnouncement } from "@/components/staff/announcements/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function announcementFromDocument(id: string, data: Record<string, unknown>): GuildAnnouncement {
  const rawStatus = stringValue(data.status);
  const rawCategory = stringValue(data.category);
  return {
    id,
    title: stringValue(data.title) || "Untitled announcement",
    body: stringValue(data.body),
    category: announcementCategories.find((item) => item.toLowerCase() === rawCategory.toLowerCase()) ?? "Guild update",
    status: announcementStatuses.find((item) => item.toLowerCase() === rawStatus.toLowerCase()) ?? "Draft",
    publishAt: readDate(data.publishAt),
    createdAt: readDate(data.createdAt),
    updatedAt: readDate(data.updatedAt),
    createdBy: stringValue(data.createdBy),
    createdByName: stringValue(data.createdByName),
  };
}

export default function StaffAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<GuildAnnouncement[]>([]);
  const [preview, setPreview] = useState<GuildAnnouncement | null>(null);
  const [editing, setEditing] = useState<GuildAnnouncement | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, "announcements"));
      const rows = snapshot.docs.map((entry) => announcementFromDocument(entry.id, entry.data())).sort((a, b) => (b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0));
      setAnnouncements(rows);
      setPreview((current) => current ? rows.find((item) => item.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load staff announcements:", loadError);
      setError("Announcements could not be loaded. Check your connection and permissions, then try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);

  const filteredAnnouncements = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return announcements.filter((item) => {
      const matchesText = !needle || `${item.title} ${item.body} ${item.createdByName}`.toLowerCase().includes(needle);
      return matchesText && (status === "all" || item.status === status) && (category === "all" || item.category === category);
    });
  }, [announcements, search, status, category]);

  function clearFilters() { setSearch(""); setStatus("all"); setCategory("all"); }
  function createAnnouncement() { setEditing(null); setComposerOpen(true); }
  function editAnnouncement(announcement: GuildAnnouncement) { setEditing(announcement); setComposerOpen(true); }
  function closeComposer() { setComposerOpen(false); setEditing(null); }

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><Megaphone className="size-4" aria-hidden="true" />Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Announcements</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Prepare clear updates for guild members, save drafts, and schedule upcoming announcements.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button><Button type="button" onClick={createAnnouncement}><Plus className="size-4" aria-hidden="true" />Create announcement</Button></div></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}
    <AnnouncementSummary announcements={announcements} loading={loading} />
    <section className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 to-card p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6"><div><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Good announcements have a next step</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Make every update easy to act on.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Share what is happening, who it affects, and what members should do next. You can preview a draft before changing its status.</p></div><Button type="button" variant="outline" onClick={createAnnouncement} className="mt-4 shrink-0 bg-background sm:mt-0"><Plus className="size-4" aria-hidden="true" />Write an update</Button></section>
    <AnnouncementDirectory announcements={filteredAnnouncements} allAnnouncements={announcements} currentUserId={user?.uid ?? ""} loading={loading} search={search} status={status} category={category} onSearch={setSearch} onStatus={setStatus} onCategory={setCategory} onClear={clearFilters} onOpen={setPreview} onEdit={editAnnouncement} />
    <AnnouncementComposerDialog key={`${editing?.id ?? "new"}-${composerOpen}`} open={composerOpen} announcement={editing} onClose={closeComposer} onSaved={() => void refresh()} />
    <AnnouncementPreviewDialog announcement={preview} onClose={() => setPreview(null)} />
  </div>;
}
