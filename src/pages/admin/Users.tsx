import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Download, RefreshCw, Search, UsersRound } from "lucide-react";
import { db } from "@/firebase";
import { useAuth, type UserRole } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminUserDetails, { type AdminUser } from "@/components/admin/AdminUserDetails";

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date) : "—";
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const rows = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          displayName: stringValue(data.displayName),
          email: stringValue(data.email),
          role: stringValue(data.role),
          createdAt: toDate(data.createdAt),
          professionalTitle: stringValue(data.professionalTitle),
          workType: stringValue(data.workType),
          experienceYears: stringValue(data.experienceYears),
          skills: stringValue(data.skills),
          location: stringValue(data.location),
          bio: stringValue(data.bio),
          interests: stringValue(data.interests),
          websiteUrl: stringValue(data.websiteUrl),
          linkedinUrl: stringValue(data.linkedinUrl),
          githubUrl: stringValue(data.githubUrl),
          twitterUrl: stringValue(data.twitterUrl),
          discordHandle: stringValue(data.discordHandle),
        } satisfies AdminUser;
      }).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setUsers(rows);
      setSelectedUser((current) => current ? rows.find((row) => row.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load admin users:", loadError);
      setError("We couldn't load user accounts. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(task);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return users.filter((account) => {
      const matchesRole = roleFilter === "all" || (roleFilter === "unassigned" ? !account.role : account.role === roleFilter);
      const matchesSearch = !queryText || [account.displayName, account.email, account.professionalTitle, account.skills, account.location]
        .some((value) => value.toLowerCase().includes(queryText));
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  const roleCount = (role: UserRole) => users.filter((account) => account.role === role).length;
  const completeCount = users.filter((account) => account.professionalTitle && account.workType && account.experienceYears && account.skills && account.location).length;

  function exportCsv() {
    const columns: (keyof AdminUser)[] = ["displayName", "email", "role", "professionalTitle", "workType", "experienceYears", "skills", "location", "createdAt"];
    const escape = (value: unknown) => {
      const text = String(value instanceof Date ? formatDate(value) : value ?? "");
      const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const csv = [columns.join(","), ...filteredUsers.map((account) => columns.map((column) => escape(account[column])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "monarch-guild-users.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Members</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Browse member profiles, understand the skills across your community, and manage workspace roles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={!filteredUsers.length}><Download className="size-4" />Export CSV</Button>
          <Button variant="outline" onClick={() => void loadUsers()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>
      </section>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => void loadUsers()}>Try again</Button></div>}

      <section aria-label="User account totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="All accounts" value={users.length} detail="People in the guild" icon={UsersRound} loading={loading && users.length === 0} />
        <AdminStatCard label="Members" value={roleCount("member")} detail="Community participants" icon={UsersRound} loading={loading && users.length === 0} />
        <AdminStatCard label="Staff" value={roleCount("staff")} detail="Guild operations team" icon={UsersRound} loading={loading && users.length === 0} />
        <AdminStatCard label="Profiles ready" value={completeCount} detail="Have core work details added" icon={UsersRound} loading={loading && users.length === 0} />
      </section>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="font-semibold">Guild directory</h2><p className="mt-1 text-sm text-muted-foreground">{filteredUsers.length} {filteredUsers.length === 1 ? "account" : "accounts"} shown</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, skill, email…" aria-label="Search user accounts" className="pl-9" /></div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value ?? "all")}>
                <SelectTrigger aria-label="Filter users by role" className="w-full bg-background sm:w-40"><SelectValue placeholder="All roles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea orientation="horizontal" className="w-full">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-y border-border bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Professional focus</th><th className="px-4 py-3 font-medium">Skills</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 text-right font-medium">Details</th></tr></thead>
              <tbody className="divide-y divide-border">
                {loading && users.length === 0 ? Array.from({ length: 5 }, (_, i) => <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-7 animate-pulse rounded-lg bg-muted" /></td></tr>) : filteredUsers.map((account) => <tr key={account.id} className="transition-colors hover:bg-muted/25">
                  <td className="px-4 py-3.5"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-700 dark:text-amber-200">{(account.displayName || account.email || "?").slice(0, 1).toUpperCase()}</span><span className="min-w-0"><span className="block max-w-52 truncate font-medium">{account.displayName || "Guild member"}</span><span className="block max-w-52 truncate text-xs text-muted-foreground">{account.email || "No email listed"}</span></span></div></td>
                  <td className="px-4 py-3.5"><span className="block max-w-44 truncate">{account.professionalTitle || <span className="text-muted-foreground">Not added</span>}</span><span className="text-xs capitalize text-muted-foreground">{account.workType || "Profile incomplete"}</span></td>
                  <td className="px-4 py-3.5"><span className="block max-w-56 truncate text-muted-foreground">{account.skills || "—"}</span></td>
                  <td className="px-4 py-3.5"><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">{account.role || "unassigned"}</span></td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">{formatDate(account.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right"><Button variant="outline" size="sm" onClick={() => setSelectedUser(account)}>View profile</Button></td>
                </tr>)}
                {!loading && filteredUsers.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center"><p className="font-medium">No accounts match those filters</p><p className="mt-1 text-sm text-muted-foreground">Try another search or select a different role.</p></td></tr>}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AdminUserDetails
        user={selectedUser}
        currentUserId={currentUser?.uid ?? ""}
        onClose={() => setSelectedUser(null)}
        onRoleChanged={(id, role) => {
          setUsers((current) =>
            current.map((entry) => (entry.id === id ? { ...entry, role } : entry)),
          );
          setSelectedUser((current) =>
            current?.id === id ? { ...current, role } : current,
          );
        }}
      />
    </div>
  );
}
