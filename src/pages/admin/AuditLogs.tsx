import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ClipboardList, RefreshCw } from "lucide-react";
import AuditLogDetailsDialog from "@/components/admin/audit-logs/AuditLogDetailsDialog";
import AuditLogDirectory from "@/components/admin/audit-logs/AuditLogDirectory";
import AuditLogSummary from "@/components/admin/audit-logs/AuditLogSummary";
import type { AuditLogEntry } from "@/components/admin/audit-logs/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function asString(value: unknown) { return typeof value === "string" ? value : ""; }
function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function asMetadata(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function fromDocument(id: string, data: Record<string, unknown>): AuditLogEntry {
  return {
    id, action: asString(data.action) || asString(data.event) || asString(data.type), category: asString(data.category) || asString(data.module) || asString(data.resourceType),
    actorName: asString(data.actorName) || asString(data.userName) || asString(data.performedByName), actorEmail: asString(data.actorEmail) || asString(data.userEmail) || asString(data.performedByEmail),
    actorId: asString(data.actorId) || asString(data.userId) || asString(data.performedBy), target: asString(data.target) || asString(data.targetName) || asString(data.resourceName),
    targetId: asString(data.targetId) || asString(data.resourceId), description: asString(data.description) || asString(data.details) || asString(data.summary),
    severity: asString(data.severity) || "", createdAt: asDate(data.createdAt) || asDate(data.timestamp), metadata: asMetadata(data.metadata ?? data.changes),
  };
}

export default function AdminAuditLogs() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]); const [selected, setSelected] = useState<AuditLogEntry | null>(null);
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("all"); const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [asOf, setAsOf] = useState<Date | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, "auditLogs"));
      const rows = snapshot.docs.map((entry) => fromDocument(entry.id, entry.data())).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setEntries(rows); setAsOf(new Date()); setSelected((current) => current ? rows.find((entry) => entry.id === current.id) ?? null : null);
    } catch (loadError) { console.error("Failed to load audit logs:", loadError); setError("Audit logs could not be loaded. Check your connection and permissions, then try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  const categories = useMemo(() => [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [entries]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase(); const now = asOf?.getTime() ?? 0; const cutoff = period === "24h" ? now - 86400000 : period === "7d" ? now - 7 * 86400000 : period === "30d" ? now - 30 * 86400000 : null;
    return entries.filter((entry) => {
      const searchable = [entry.action, entry.category, entry.actorName, entry.actorEmail, entry.actorId, entry.target, entry.targetId, entry.description, entry.severity].join(" ").toLowerCase();
      return (!needle || searchable.includes(needle)) && (category === "all" || entry.category === category) && (cutoff === null || Boolean(entry.createdAt && entry.createdAt.getTime() >= cutoff));
    });
  }, [entries, search, category, period, asOf]);
  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><ClipboardList className="size-4" aria-hidden="true" />Guild administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Audit Logs</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Review administrative activity, understand who changed what, and investigate sensitive actions with their recorded context.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh logs</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}
    <AuditLogSummary entries={entries} loading={loading} asOf={asOf} />
    <AuditLogDirectory entries={filtered} loading={loading} search={search} category={category} period={period} categories={categories} onSearch={setSearch} onCategory={setCategory} onPeriod={setPeriod} onSelect={setSelected} />
    <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">This page displays records from Firestore’s <code className="rounded bg-muted px-1 py-0.5">auditLogs</code> collection. The current app does not yet write administrative actions to this collection, so it may remain empty until audit event recording is connected.</p>
    <AuditLogDetailsDialog entry={selected} onClose={() => setSelected(null)} />
  </div>;
}
