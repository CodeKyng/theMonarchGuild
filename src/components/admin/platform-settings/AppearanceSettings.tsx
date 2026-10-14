import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const options = [
  { id: "light", label: "Light", description: "Use the light workspace appearance.", icon: Sun },
  { id: "dark", label: "Dark", description: "Use the dark workspace appearance.", icon: Moon },
  { id: "system", label: "System", description: "Follow this device’s appearance preference.", icon: Laptop },
] as const;
export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  return <Card className="border-border/70 shadow-sm"><CardHeader><CardTitle>Workspace appearance</CardTitle><p className="text-sm text-muted-foreground">Choose the theme used across the admin workspace. This preference is saved in this browser.</p></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{options.map(({ id, label, description, icon: Icon }) => { const selected = theme === id; return <button key={id} type="button" aria-pressed={selected} onClick={() => setTheme(id)} className={`flex min-w-0 items-start gap-3 rounded-xl border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted/50"}`}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted"><Icon className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-sm font-semibold">{label}{selected && <Check className="size-4 text-primary" aria-label="Selected" />}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span></button>; })}</CardContent></Card>;
}
