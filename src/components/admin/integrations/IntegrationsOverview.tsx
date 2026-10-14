import { Blocks, CheckCircle2, Layers3, ShieldCheck } from "lucide-react";
import type { GuildIntegration } from "@/components/admin/integrations/types";

export default function IntegrationsOverview({ integrations }: { integrations: GuildIntegration[] }) {
  const core = integrations.filter((item) => item.category === "Core platform").length;
  const auth = integrations.filter((item) => item.category === "Authentication").length;
  const cards = [
    { label: "App integrations", value: integrations.length, note: "Services referenced by app code", icon: Blocks, tone: "text-sky-700 bg-sky-500/10" },
    { label: "Core platform", value: core, note: "Identity and data services", icon: Layers3, tone: "text-violet-700 bg-violet-500/10" },
    { label: "Sign-in providers", value: auth, note: "OAuth providers in the sign-in flow", icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-500/10" },
    { label: "External credentials", value: "Console", note: "Configured outside this workspace", icon: ShieldCheck, tone: "text-amber-700 bg-amber-500/10" },
  ];
  return <section aria-label="Integrations overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" aria-hidden="true" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></article>)}</section>;
}
