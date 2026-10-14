import { ArrowUpRight, ClipboardList, KeyRound, Plug, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { title: "Roles & Permissions", description: "Review role access and staff capabilities.", href: "/admin/roles-permissions", icon: KeyRound },
  { title: "Security Center", description: "Inspect privileged accounts and security coverage.", href: "/admin/security-center", icon: ShieldCheck },
  { title: "Integrations", description: "Review app-connected services and provider setup.", href: "/admin/integrations", icon: Plug },
  { title: "Audit Logs", description: "Review available administrative activity records.", href: "/admin/audit-logs", icon: ClipboardList },
];
export default function AdminSettingsLinks() {
  return <Card className="border-border/70 shadow-sm"><CardHeader><CardTitle>Administration shortcuts</CardTitle><p className="text-sm text-muted-foreground">Open the workspace that owns each operational setting.</p></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{links.map(({ title, description, href, icon: Icon }) => <Link key={href} to={href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:bg-muted/50"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Icon className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" /></Link>)}</CardContent></Card>;
}
