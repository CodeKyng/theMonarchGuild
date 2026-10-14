import { ArrowUpRight, BriefcaseBusiness, Code2, Globe, UsersRound } from "lucide-react";
import type { ProfileData } from "@/components/editprofile";

const linkItems = [
  { key: "websiteUrl", label: "Portfolio", icon: Globe },
  { key: "linkedinUrl", label: "LinkedIn", icon: UsersRound },
  { key: "githubUrl", label: "GitHub", icon: Code2 },
  { key: "twitterUrl", label: "X / Twitter", icon: BriefcaseBusiness },
] as const;

export default function ProfileLinks({ profile }: { profile: ProfileData }) {
  const links = linkItems.filter(({ key }) => profile[key].trim());
  return <div className="space-y-2">{links.map(({ key, label, icon: Icon }) => <a key={key} href={profile[key]} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/50"><Icon className="size-4 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span><ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /></a>)}{profile.discordHandle && <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Discord</p><p className="mt-1 break-all text-sm font-medium">{profile.discordHandle}</p></div>}{!links.length && !profile.discordHandle && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Add your portfolio and social links so other builders can connect.</p>}</div>;
}
