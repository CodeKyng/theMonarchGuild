import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { LockKeyhole, RefreshCw } from "lucide-react";
import AccessDirectory from "@/components/admin/security-center/AccessDirectory";
import SecurityControlsPanel from "@/components/admin/security-center/SecurityControlsPanel";
import SecurityEventList from "@/components/admin/security-center/SecurityEventList";
import SecurityOverview from "@/components/admin/security-center/SecurityOverview";
import type { SecurityAccount, SecurityEvent, SecurityRole } from "@/components/admin/security-center/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function asString(value: unknown) { return typeof value === "string" ? value : ""; }
function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function readRole(value: unknown): SecurityRole { return value === "admin" || value === "staff" || value === "member" ? value : "unassigned"; }

export default function AdminSecurityCenter() {
  const [accounts, setAccounts] = useState<SecurityAccount[]>([]); const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [search, setSearch] = useState(""); const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [eventsAvailable, setEventsAvailable] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    const [accountsResult, eventsResult] = await Promise.allSettled([getDocs(collection(db, "users")), getDocs(collection(db, "auditLogs"))]);
    if (accountsResult.status === "fulfilled") {
      const rows = accountsResult.value.docs.map((entry) => {
        const data = entry.data();
        const flagged = data.securityFlagged === true || data.requiresSecurityReview === true;
        return { id: entry.id, name: asString(data.displayName) || asString(data.name), email: asString(data.email), role: readRole(data.role), createdAt: asDate(data.createdAt), flagged, flagReason: asString(data.securityFlagReason) || asString(data.securityNote) } satisfies SecurityAccount;
      }).sort((a, b) => Number(b.role === "admin") - Number(a.role === "admin") || Number(b.role === "staff") - Number(a.role === "staff") || a.name.localeCompare(b.name));
      setAccounts(rows);
    } else {
      console.error("Failed to load security accounts:", accountsResult.reason);
      setError("Account access could not be loaded. Check your connection and permissions, then try again.");
    }
    if (eventsResult.status === "fulfilled") {
      const rows = eventsResult.value.docs.map((entry) => {
        const data = entry.data();
        return { id: entry.id, action: asString(data.action) || asString(data.event) || asString(data.type), category: asString(data.category) || asString(data.module) || asString(data.severity), actor: asString(data.actorName) || asString(data.actorEmail) || asString(data.userName), target: asString(data.target) || asString(data.targetName) || asString(data.resourceName), severity: asString(data.severity), createdAt: asDate(data.createdAt) || asDate(data.timestamp) } satisfies SecurityEvent;
      }).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setEvents(rows); setEventsAvailable(true);
    } else {
      console.warn("Audit event records are unavailable:", eventsResult.reason);
      setEvents([]); setEventsAvailable(false);
    }
    setLoading(false);
  }, []);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  const filteredAccounts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return accounts.filter((account) => (!needle || [account.name, account.email, account.id, account.role].some((value) => value.toLowerCase().includes(needle))) && (role === "all" || account.role === role));
  }, [accounts, search, role]);
  const flaggedCount = accounts.filter((account) => account.flagged).length;
  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><LockKeyhole className="size-4" aria-hidden="true" />Guild administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Security Center</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Review privileged accounts, check the security controls configured in the app, and find recorded administrative activity.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh security data</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}
    <SecurityOverview accounts={accounts} eventCount={events.length} flaggedCount={flaggedCount} loading={loading} />
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]"><SecurityControlsPanel /><SecurityEventList events={events} available={eventsAvailable} /></section>
    <AccessDirectory accounts={filteredAccounts} loading={loading} search={search} role={role} onSearch={setSearch} onRole={setRole} />
    <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">Account flags are shown only when profile fields <code className="rounded bg-muted px-1 py-0.5">securityFlagged</code> or <code className="rounded bg-muted px-1 py-0.5">requiresSecurityReview</code> are set. MFA enrollment, sign-in history, and account lockout are managed outside this app. Audit events come from <code className="rounded bg-muted px-1 py-0.5">auditLogs</code>; event recording is not currently connected.</p>
  </div>;
}
