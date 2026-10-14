import { Plug } from "lucide-react";
import IntegrationCard from "@/components/admin/integrations/IntegrationCard";
import IntegrationFilters from "@/components/admin/integrations/IntegrationFilters";
import type { GuildIntegration } from "@/components/admin/integrations/types";
import { Card, CardContent } from "@/components/ui/card";

export default function IntegrationsDirectory({ integrations, search, category, onSearch, onCategory, onDetails }: { integrations: GuildIntegration[]; search: string; category: string; onSearch: (value: string) => void; onCategory: (value: string) => void; onDetails: (integration: GuildIntegration) => void }) {
  return <Card className="border-border/70 shadow-sm"><CardContent className="space-y-5 p-4 sm:p-6"><IntegrationFilters search={search} category={category} onSearch={onSearch} onCategory={onCategory} />{integrations.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{integrations.map((integration) => <IntegrationCard key={integration.id} integration={integration} onDetails={onDetails} />)}</div> : <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center"><Plug className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" /><h3 className="mt-3 font-semibold">No integrations match</h3><p className="mt-1 text-sm text-muted-foreground">Try another category or search term.</p></div>}</CardContent></Card>;
}
