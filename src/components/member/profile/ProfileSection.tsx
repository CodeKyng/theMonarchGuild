import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileSection({ title, icon, children, className = "" }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return <Card className={`h-full border-border/70 shadow-sm ${className}`}><CardHeader className="flex flex-row items-center gap-3 pb-0"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="pt-4">{children}</CardContent></Card>;
}
