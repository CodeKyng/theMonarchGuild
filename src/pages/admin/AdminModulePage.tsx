import { ArrowRight, Compass, type LucideIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminModuleContent } from "@/pages/admin/adminModuleContent";

export default function AdminModulePage() {
  const { section = "" } = useParams();
  const page = adminModuleContent[section];

  if (!page) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Admin page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a section from the administration menu.</p>
      </section>
    );
  }

  const Icon = page.icon;

  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-800 dark:text-amber-200">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{page.description}</p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Compass className="size-4 text-primary" />Section overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{page.overview}</p>
            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <p className="text-sm font-medium">Admin workspace</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">This section is part of the guild admin workspace. Available records and controls will appear here as this area is connected to the platform data.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader><CardTitle>Admin workflow</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {page.workflow.map((step, index) => (
              <div key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">{index + 1}</span>
                <p className="text-sm leading-5 text-muted-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {page.principles.map(({ title, description, icon: PrincipleIcon }) => (
          <Card key={title} className="border-border/70 shadow-sm">
            <CardContent className="flex gap-3 p-5">
              <PrincipleIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="admin-related-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 id="admin-related-title" className="text-base font-semibold">Related admin sections</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {page.related.map(({ label, href }) => (
            <Link key={href} to={href} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {label}<ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export interface AdminModuleConfig {
  title: string;
  description: string;
  overview: string;
  workflow: string[];
  principles: { title: string; description: string; icon: LucideIcon }[];
  related: { label: string; href: string }[];
}
