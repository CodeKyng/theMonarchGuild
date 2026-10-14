import { Check, Minus } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

const permissions = [
  { capability: "Access assigned workspace", member: true, staff: true, admin: true },
  { capability: "View and edit own profile", member: true, staff: true, admin: true },
  { capability: "Be assigned jobs", member: false, staff: true, admin: true },
  { capability: "Open the admin workspace", member: false, staff: false, admin: true },
  { capability: "View member and staff directories", member: false, staff: false, admin: true },
  { capability: "Assign workspace roles", member: false, staff: false, admin: true },
  { capability: "Create guild events", member: false, staff: false, admin: true },
  { capability: "View guild analytics", member: false, staff: false, admin: true },
] as const;

function AccessMark({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"><Check className="size-4" aria-hidden="true" />Allowed<span className="sr-only"> for this role</span></span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Minus className="size-4" aria-hidden="true" />Not allowed</span>
  );
}

export default function PermissionsMatrix() {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Workspace permissions</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">This matrix shows workspace access and the intended role eligibility for job assignments.</p>
      </div>
      <ScrollArea orientation="horizontal" className="w-full">
        <table className="w-full min-w-[680px] border-t border-border text-left text-sm">
          <caption className="sr-only">Current capabilities available to each workspace role</caption>
          <thead className="bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th scope="col" className="px-5 py-3 font-medium">Capability</th><th scope="col" className="px-5 py-3 font-medium">Member</th><th scope="col" className="px-5 py-3 font-medium">Staff</th><th scope="col" className="px-5 py-3 font-medium">Admin</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {permissions.map((row) => (
              <tr key={row.capability}>
                <th scope="row" className="px-5 py-3.5 font-medium">{row.capability}</th>
                <td className="px-5 py-3.5"><AccessMark allowed={row.member} /></td>
                <td className="px-5 py-3.5"><AccessMark allowed={row.staff} /></td>
                <td className="px-5 py-3.5"><AccessMark allowed={row.admin} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </section>
  );
}
