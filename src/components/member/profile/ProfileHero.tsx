import { ArrowUpRight, MapPin, Pencil, Sparkles, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfileHero({
  name,
  title,
  workType,
  location,
  photoUrl,
  completion,
  onEdit,
  followerCount = 0,
  followingCount = 0,
}: {
  name: string;
  title: string;
  workType: string;
  location: string;
  photoUrl: string | null;
  completion: number;
  onEdit: () => void;
  followerCount?: number;
  followingCount?: number;
}) {
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 p-4 pt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:p-6 sm:pt-10">
        <div className="flex min-w-0 items-end gap-3 sm:gap-4">
          <Avatar className="size-16 shrink-0 border-4 border-card shadow-md sm:size-20">
            <AvatarImage src={photoUrl ?? undefined} alt={name} />
            <AvatarFallback className="text-lg font-semibold">{initials || "MG"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 pb-0.5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
              Member profile
            </p>
            <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
              {name || "Your profile"}
            </h1>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {title || "Add your professional title"}
              {workType ? ` · ${workType}` : ""}
            </p>
            {location && (
              <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{location}</span>
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-foreground tabular-nums">{followerCount}</span> followers
              </span>
              <span>
                <span className="font-semibold text-foreground tabular-nums">{followingCount}</span> following
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:items-end">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground sm:justify-end">
            <span>Profile completeness</span>
            <span className="font-semibold text-foreground">{completion}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:w-44">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
          </div>
          <Button type="button" onClick={onEdit} size="sm" className="mt-0.5 w-full sm:w-auto">
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit profile
            <ArrowUpRight className="size-3.5 opacity-70" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
