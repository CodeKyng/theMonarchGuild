import { useCallback, useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { RefreshCw, ShieldCheck } from "lucide-react";

import PermissionsMatrix from "@/components/admin/roles-permissions/PermissionsMatrix";
import RoleManagementCard from "@/components/admin/roles-permissions/RoleManagementCard";
import RoleSummaryGrid from "@/components/admin/roles-permissions/RoleSummaryGrid";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

export default function AdminRolesPermissions() {
  const [counts, setCounts] = useState<Record<string, number>>({ member: 0, staff: 0, admin: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const users = collection(db, "users");
      const [members, staff, admins] = await Promise.all([
        getCountFromServer(query(users, where("role", "==", "member"))),
        getCountFromServer(query(users, where("role", "==", "staff"))),
        getCountFromServer(query(users, where("role", "==", "admin"))),
      ]);
      setCounts({ member: members.data().count, staff: staff.data().count, admin: admins.data().count });
    } catch (loadError) {
      console.error("Failed to load workspace role counts:", loadError);
      setError("Role totals could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><ShieldCheck className="size-4" aria-hidden="true" />Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Roles &amp; Permissions</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Understand workspace access and see which responsibilities belong to Members, Staff, and Admins.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh roles
        </Button>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <RoleSummaryGrid counts={counts} loading={loading} />

      <div className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">
        Workspace access is determined by the role saved on each account. Staff are eligible to be assigned jobs; the job assignment workflow itself is not yet available in the app. Finer-grained permission settings are not configured.
      </div>

      <PermissionsMatrix />
      <RoleManagementCard />
    </div>
  );
}
