import { Medal, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicLeaderboardEntry } from "@/components/member/leaderboard/types";

export default function LeaderboardStats({ entries, currentUserId, currentUserPoints }: { entries: PublicLeaderboardEntry[]; currentUserId: string; currentUserPoints: number }) {
  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
  const currentRank = entries.findIndex((entry) => entry.id === currentUserId) + 1;
  const stats = [
    { label: "Members sharing", value: entries.length, detail: "Opted into the board", icon: Medal, tone: "text-violet-600 bg-violet-500/10" },
    { label: "Points celebrated", value: totalPoints.toLocaleString(), detail: "Guild recognition", icon: Sparkles, tone: "text-amber-600 bg-amber-500/10" },
    { label: "Your standing", value: currentRank ? `#${currentRank}` : currentUserPoints ? "Not listed" : "—", detail: currentRank ? `${currentUserPoints.toLocaleString()} points` : "Opt in to appear", icon: Trophy, tone: "text-sky-600 bg-sky-500/10" },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, detail, icon: Icon, tone }) => <Card key={label} className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label} · {detail}</p></div></CardContent></Card>)}</div>;
}
