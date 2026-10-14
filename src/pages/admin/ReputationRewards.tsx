import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Award, RefreshCw, Sparkles } from "lucide-react";
import AwardContributionDialog from "@/components/admin/reputation-rewards/AwardContributionDialog";
import MemberLeaderboard from "@/components/admin/reputation-rewards/MemberLeaderboard";
import RewardActivityList from "@/components/admin/reputation-rewards/RewardActivityList";
import RewardsOverview from "@/components/admin/reputation-rewards/RewardsOverview";
import type { ReputationMember, RewardActivity } from "@/components/admin/reputation-rewards/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function asString(value: unknown) { return typeof value === "string" ? value : ""; }
function asPoints(value: unknown) { return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0; }
function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}

export default function AdminReputationRewards() {
  const [members, setMembers] = useState<ReputationMember[]>([]);
  const [activity, setActivity] = useState<RewardActivity[]>([]);
  const [selectedMember, setSelectedMember] = useState<ReputationMember | null>(null);
  const [awardOpen, setAwardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [usersSnapshot, rewardsSnapshot] = await Promise.all([getDocs(collection(db, "users")), getDocs(collection(db, "reputationRewards"))]);
      const counts = new Map<string, number>();
      const rows = rewardsSnapshot.docs.map((entry) => {
        const data = entry.data(); const memberId = asString(data.userId) || asString(data.memberId);
        if (memberId) counts.set(memberId, (counts.get(memberId) ?? 0) + 1);
        return { id: entry.id, memberId, memberName: asString(data.memberName), title: asString(data.title) || asString(data.reason), category: asString(data.category), points: asPoints(data.points), note: asString(data.note), createdAt: asDate(data.createdAt) } satisfies RewardActivity;
      }).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      const people = usersSnapshot.docs.map((entry) => { const data = entry.data(); return { id: entry.id, name: asString(data.displayName) || asString(data.name), email: asString(data.email), role: asString(data.role), points: asPoints(data.reputationPoints ?? data.points), contributions: counts.get(entry.id) ?? 0 } satisfies ReputationMember; }).sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
      setMembers(people); setActivity(rows);
    } catch (loadError) { console.error("Failed to load reputation data:", loadError); setError("Reputation data could not be loaded. Check your connection and permissions, then try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  const initialMember = useMemo(() => selectedMember ? members.find((person) => person.id === selectedMember.id) ?? selectedMember : null, [members, selectedMember]);
  function recordAward(draft: { member: ReputationMember; title: string; category: string; points: number; note: string }) {
    setMembers((current) => current.map((person) => person.id === draft.member.id ? { ...person, points: person.points + draft.points, contributions: person.contributions + 1 } : person).sort((a, b) => b.points - a.points || a.name.localeCompare(b.name)));
    setActivity((current) => [{ id: `local-${Date.now()}`, memberId: draft.member.id, memberName: draft.member.name || draft.member.email, title: draft.title, category: draft.category, points: draft.points, note: draft.note, createdAt: new Date() }, ...current]);
  }
  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><Sparkles className="size-4" aria-hidden="true" />Guild administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Reputation &amp; Rewards</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Recognize meaningful work across projects, learning, mentorship, and community participation so members can grow together.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button><Button type="button" onClick={() => { setSelectedMember(null); setAwardOpen(true); }} disabled={members.length === 0} className="bg-amber-400 text-black hover:bg-amber-300"><Award className="size-4" aria-hidden="true" />Recognize contribution</Button></div></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}
    <RewardsOverview members={members} activity={activity} loading={loading} />
    <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]"><MemberLeaderboard members={members} loading={loading} onAward={(member) => { setSelectedMember(member); setAwardOpen(true); }} /><RewardActivityList activity={activity} loading={loading} /></section>
    <div className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">Awards are recorded in <code className="rounded bg-muted px-1 py-0.5">reputationRewards</code> and update <code className="rounded bg-muted px-1 py-0.5">reputationPoints</code> on the member’s <code className="rounded bg-muted px-1 py-0.5">users</code> profile. Points represent guild recognition and have no cash value or automatic redemption.</div>
    <AwardContributionDialog key={`${awardOpen}-${initialMember?.id ?? "all"}`} open={awardOpen} members={members} initialMember={initialMember} onClose={() => setAwardOpen(false)} onAwarded={recordAward} />
  </div>;
}
