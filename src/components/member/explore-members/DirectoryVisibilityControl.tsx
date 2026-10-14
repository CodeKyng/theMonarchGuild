import { Eye, EyeOff, UsersRound } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function DirectoryVisibilityControl({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  const id = "profile-member-directory-visibility";
  return <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UsersRound className="size-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><Label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm font-semibold">{checked ? <Eye className="size-3.5 text-emerald-600" aria-hidden="true" /> : <EyeOff className="size-3.5 text-muted-foreground" aria-hidden="true" />}Show my professional profile in Explore Members</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">When enabled, signed-in guild members can see your name, work details, skills, location, bio, interests, and professional links. Your email and account settings are never included.</p></div><input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 shrink-0 accent-primary disabled:cursor-not-allowed disabled:opacity-50" /></div>;
}
