import { CheckCircle2, FileCheck2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const checklist = [
  { title: "Make the next step clear", detail: "Tell members how to attend, learn, contribute, or apply." },
  { title: "Keep details accurate", detail: "Check dates, links, eligibility, and contact information before sharing." },
  { title: "Connect content to growth", detail: "Give members a practical path to learn, show their work, or earn." },
];

export default function CommunityPublishingChecklist() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileCheck2 className="size-4 text-primary" />Publishing checklist</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">A quick quality check for updates shared with guild members.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklist.map(({ title, detail }) => (
          <div key={title} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <div><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
