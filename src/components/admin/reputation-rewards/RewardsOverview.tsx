import { Award, Crown, Flame, Sparkles } from "lucide-react";
import type { ReputationMember, RewardActivity } from "@/components/admin/reputation-rewards/types";

export default function RewardsOverview({ members, activity, loading }: { members: ReputationMember[]; activity: RewardActivity[]; loading: boolean }) {
  const totalPoints = members.reduce((sum, member) => sum + member.points, 0);
  const activeMembers = members.filter((member) => member.points > 0).length;
  const awarded = activity.reduce((sum, reward) => sum + reward.points, 0);
  const cards = [
    { label: "Guild reputation points", value: totalPoints.toLocaleString(), icon: Sparkles, tone: "text-amber-700 bg-amber-500/10" },
    { label: "Recognized members", value: activeMembers.toLocaleString(), icon: Crown, tone: "text-violet-700 bg-violet-500/10" },
    { label: "Awards recorded", value: activity.length.toLocaleString(), icon: Award, tone: "text-sky-700 bg-sky-500/10" },
    { label: "Points awarded", value: awarded.toLocaleString(), icon: Flame, tone: "text-orange-700 bg-orange-500/10" },
  ];
  return <section aria-label="Reputation overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" aria-hidden="true" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" /> : value}</p></article>)}</section>;
}
