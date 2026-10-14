import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import LeaderboardFilters from "@/components/member/leaderboard/LeaderboardFilters";
import LeaderboardHeader from "@/components/member/leaderboard/LeaderboardHeader";
import LeaderboardStats from "@/components/member/leaderboard/LeaderboardStats";
import LeaderboardTable from "@/components/member/leaderboard/LeaderboardTable";
import LeaderboardVisibilityCard from "@/components/member/leaderboard/LeaderboardVisibilityCard";
import type { PublicLeaderboardEntry } from "@/components/member/leaderboard/types";
import { db } from "@/firebase";

function asName(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function asPoints(value: unknown) { return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0; }

export default function MemberLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PublicLeaderboardEntry[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [visible, setVisible] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("points");
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      if (!active) return;
      const data = snapshot.data() ?? {};
      const displayName = asName(data.displayName) || user.displayName || "";
      setCurrentPoints(asPoints(data.reputationPoints));
      setVisible(data.showOnLeaderboard === true);
      setProfileReady(Boolean(displayName && asName(data.professionalTitle) && asName(data.workType) && asName(data.experienceYears) && asName(data.skills) && asName(data.location)));
    }).catch((loadError) => {
      console.error("Failed to load personal leaderboard settings:", loadError);
      if (active) setError("Your leaderboard settings could not be loaded. Try again shortly.");
    }).finally(() => { if (active) setSettingsLoading(false); });
    return () => { active = false; };
  }, [user, retryToken]);

  useEffect(() => onSnapshot(collection(db, "publicLeaderboard"), (snapshot) => {
    const rows = snapshot.docs.map((entry) => {
      const data = entry.data();
      return { id: entry.id, displayName: asName(data.displayName), points: asPoints(data.points) } satisfies PublicLeaderboardEntry;
    }).filter((entry) => entry.displayName.length > 0);
    rows.sort((a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName));
    setEntries(rows);
    setError("");
    setLoading(false);
  }, (loadError) => {
    console.error("Failed to load public leaderboard:", loadError);
    setError("The leaderboard could not be loaded. Check your connection and try again.");
    setLoading(false);
  }), [retryToken]);

  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const rows = entries.filter((entry) => !needle || entry.displayName.toLocaleLowerCase().includes(needle));
    return sort === "name" ? [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName)) : rows;
  }, [entries, search, sort]);

  async function toggleVisibility() {
    if (!user || saving || settingsLoading) return;
    setSaving(true); setError("");
    try {
      const userRef = doc(db, "users", user.uid);
      const leaderboardRef = doc(db, "publicLeaderboard", user.uid);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) throw new Error("Your member profile could not be found.");
      const data = snapshot.data();
      const displayName = asName(data.displayName) || user.displayName || "";
      const ready = Boolean(displayName && asName(data.professionalTitle) && asName(data.workType) && asName(data.experienceYears) && asName(data.skills) && asName(data.location));
      if (!ready) throw new Error("Complete your Guild profile before joining the leaderboard.");
      const join = data.showOnLeaderboard !== true;
      const points = asPoints(data.reputationPoints);
      const batch = writeBatch(db);
      batch.update(userRef, { showOnLeaderboard: join, showInMemberDirectory: data.showInMemberDirectory === true, reputationPoints: points });
      if (join) batch.set(leaderboardRef, { displayName, points, updatedAt: serverTimestamp() });
      else batch.delete(leaderboardRef);
      await batch.commit();
      setCurrentPoints(points); setProfileReady(true); setVisible(join);
    } catch (toggleError) {
      console.error("Failed to update leaderboard visibility:", toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "Your leaderboard setting could not be saved. Try again.");
    } finally { setSaving(false); }
  }

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6"><LeaderboardHeader /><LeaderboardStats entries={entries} currentUserId={user?.uid ?? ""} currentUserPoints={currentPoints} /><LeaderboardVisibilityCard visible={visible} profileReady={profileReady} saving={saving || settingsLoading} onToggle={() => void toggleVisibility()} />{error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" /><p className="text-sm leading-5 text-destructive">{error}</p></div><button type="button" onClick={() => { setLoading(true); setSettingsLoading(true); setError(""); setRetryToken((value) => value + 1); }} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"><RefreshCw className="size-4" aria-hidden="true" />Try again</button></div>}<LeaderboardFilters search={search} sort={sort} onSearch={setSearch} onSort={setSort} /><LeaderboardTable entries={filteredEntries} loading={loading} hasFilters={Boolean(search.trim())} currentUserId={user?.uid ?? ""} /><p className="rounded-xl border border-border bg-muted/30 px-4 py-3.5 text-xs leading-5 text-muted-foreground">Reputation points recognize contributions to the Guild. They have no cash value and are not redeemable. The leaderboard shows all-time totals for members who opted in.</p></main>;
}
