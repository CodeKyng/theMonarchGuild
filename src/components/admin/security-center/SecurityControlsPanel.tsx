import { Check, CircleHelp, LockKeyhole, ShieldCheck, UserRoundCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const controls = [
  { title: "Admin-only workspace routes", detail: "Admin pages are guarded by the app’s role route.", icon: ShieldCheck, status: "In app" },
  { title: "Firestore access rules", detail: "User records and privileged writes use admin checks in Firestore rules.", icon: LockKeyhole, status: "Configured" },
  { title: "Multi-factor authentication", detail: "MFA enrollment and enforcement are not managed by this app.", icon: CircleHelp, status: "Review in Firebase" },
  { title: "Security event recording", detail: "Admin actions are not yet written to the audit log collection.", icon: UserRoundCog, status: "Not connected" },
];
export default function SecurityControlsPanel() {
  return <Card className="border-border/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><LockKeyhole className="size-4 text-primary" aria-hidden="true" />Security coverage</CardTitle><p className="text-sm text-muted-foreground">Current controls reflected in the project configuration.</p></CardHeader><CardContent className="space-y-3">{controls.map(({ title, detail, icon: Icon, status }) => <div key={title} className="flex gap-3 rounded-xl border border-border/70 p-3.5"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">{title}</h3><span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">{status === "In app" || status === "Configured" ? <Check className="size-3 text-emerald-600" aria-hidden="true" /> : null}{status}</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></div></div>)}</CardContent></Card>;
}
