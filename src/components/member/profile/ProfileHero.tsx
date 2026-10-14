import { ArrowUpRight, MapPin, Pencil, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfileHero({ name, title, workType, location, photoUrl, completion, onEdit }: { name: string; title: string; workType: string; location: string; photoUrl: string | null; completion: number; onEdit: () => void }) {
  const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  return <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden="true" />
    <div className="relative flex flex-col gap-5 p-5 pt-10 sm:flex-row sm:items-end sm:justify-between sm:p-8 sm:pt-12">
      <div className="flex min-w-0 items-end gap-4 sm:gap-5"><Avatar className="size-20 shrink-0 border-4 border-card shadow-md sm:size-24"><AvatarImage src={photoUrl ?? undefined} alt={name} /><AvatarFallback className="text-xl font-semibold">{initials || "MG"}</AvatarFallback></Avatar>
        <div className="min-w-0 pb-1"><p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Sparkles className="size-3.5" aria-hidden="true" />Member profile</p><h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{name || "Your profile"}</h1><p className="mt-1 break-words text-sm text-muted-foreground">{title || "Add your professional title"}{workType ? ` · ${workType}` : ""}</p>{location && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" aria-hidden="true" />{location}</p>}</div>
      </div>
      <div className="flex flex-col gap-3 sm:items-end"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>Profile completeness</span><span className="font-semibold text-foreground">{completion}%</span></div><div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:w-48"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div><Button type="button" onClick={onEdit} className="mt-1 w-full sm:w-auto"><Pencil className="size-4" aria-hidden="true" />Edit profile<ArrowUpRight className="size-4 opacity-70" aria-hidden="true" /></Button></div>
    </div>
  </section>;
}
