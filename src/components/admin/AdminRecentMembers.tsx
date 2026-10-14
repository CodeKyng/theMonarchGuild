import { UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | null;
}

function formatDate(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function AdminRecentMembers({
  members,
  loading,
}: {
  members: AdminUserRow[];
  loading: boolean;
}) {
  return (
    <Card id="accounts" className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-5 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base">Recent accounts</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">The latest people to join the guild.</p>
        </div>
        <UsersRound className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6" role="status">{[0, 1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-muted" />)}<span className="sr-only">Loading recent accounts</span></div>
        ) : members.length === 0 ? (
          <div className="px-5 pb-6 text-sm text-muted-foreground sm:px-6">No accounts to show yet.</div>
        ) : (
          <ScrollArea orientation="horizontal" className="w-full">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-y border-border bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-5 py-3 font-medium sm:px-6">Account</th><th className="px-4 py-3 font-medium">Role</th><th className="px-5 py-3 text-right font-medium sm:px-6">Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/25">
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-700 dark:text-amber-200" aria-hidden="true">
                          {(member.name || member.email || "?").slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">{member.name || "Guild member"}</span>
                          <span className="block truncate text-xs text-muted-foreground">{member.email || "No email listed"}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">{member.role || "unassigned"}</span></td>
                    <td className="px-5 py-3.5 text-right text-xs text-muted-foreground sm:px-6">{formatDate(member.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-6">Showing the latest {members.length} accounts</div>
      </CardContent>
    </Card>
  );
}
