import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { GuildIntegration } from "@/components/admin/integrations/types";
import { Button } from "@/components/ui/button";

export default function IntegrationCard({ integration, onDetails }: { integration: GuildIntegration; onDetails: (integration: GuildIntegration) => void }) {
  const Icon = integration.icon;
  return <article className="flex min-w-0 flex-col rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/30"><div className="flex items-start justify-between gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span><span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"><CheckCircle2 className="size-3" aria-hidden="true" />{integration.state}</span></div><div className="mt-4"><p className="text-xs font-medium text-muted-foreground">{integration.category}</p><h3 className="mt-1 text-lg font-semibold">{integration.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{integration.summary}</p></div><Button type="button" variant="outline" className="mt-5 w-full justify-between" onClick={() => onDetails(integration)}>Integration details<ArrowUpRight className="size-4" aria-hidden="true" /></Button></article>;
}
