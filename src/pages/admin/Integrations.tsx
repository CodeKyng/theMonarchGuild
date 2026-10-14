import { useMemo, useState } from "react";
import { Plug, ShieldCheck } from "lucide-react";
import IntegrationDetailsDialog from "@/components/admin/integrations/IntegrationDetailsDialog";
import IntegrationsDirectory from "@/components/admin/integrations/IntegrationsDirectory";
import IntegrationsOverview from "@/components/admin/integrations/IntegrationsOverview";
import { integrationCatalog } from "@/components/admin/integrations/catalog";
import type { GuildIntegration } from "@/components/admin/integrations/types";

export default function AdminIntegrations() {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("all"); const [selected, setSelected] = useState<GuildIntegration | null>(null);
  const visibleIntegrations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return integrationCatalog.filter((integration) => (!needle || [integration.name, integration.category, integration.summary, integration.description, ...integration.usedFor].join(" ").toLowerCase().includes(needle)) && (category === "all" || integration.category === category));
  }, [search, category]);
  return <div className="space-y-7">
    <header><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><Plug className="size-4" aria-hidden="true" />Guild administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Integrations</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Review the identity and data services connected to the guild app, understand what each powers, and keep setup requirements visible to administrators.</p></header>
    <IntegrationsOverview integrations={integrationCatalog} />
    <IntegrationsDirectory integrations={visibleIntegrations} search={search} category={category} onSearch={setSearch} onCategory={setCategory} onDetails={setSelected} />
    <aside className="flex gap-3 rounded-xl border border-border bg-muted/35 p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">This inventory is based on integrations referenced in the codebase. It does not verify live provider availability, credentials, or deployment settings. Provider setup and secret management remain in Firebase and provider consoles.</p></aside>
    <IntegrationDetailsDialog integration={selected} onClose={() => setSelected(null)} />
  </div>;
}
