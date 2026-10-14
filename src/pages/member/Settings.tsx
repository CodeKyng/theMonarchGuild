import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/auth/AuthContext";
import AppearanceSettings from "@/components/admin/platform-settings/AppearanceSettings";
import MemberAccountCard from "@/components/member/settings/MemberAccountCard";
import SettingsHeader from "@/components/member/settings/SettingsHeader";
import SettingsPrivacyCard from "@/components/member/settings/SettingsPrivacyCard";
import SignInSecurityCard from "@/components/member/settings/SignInSecurityCard";
import { db } from "@/firebase";

export default function MemberSettings() {
  const { user } = useAuth();
  const [directoryVisible, setDirectoryVisible] = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      if (!active) return;
      const data = snapshot.data() ?? {};
      setDirectoryVisible(data.showInMemberDirectory === true);
      setLeaderboardVisible(data.showOnLeaderboard === true);
      setLoadError("");
    }).catch((error) => {
      console.error("Failed to load member settings:", error);
      if (active) setLoadError("Your privacy settings could not be loaded. Try refreshing this page.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (!user) return null;
  return <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8">
    <SettingsHeader />
    <AppearanceSettings />
    <div className="grid gap-4 lg:grid-cols-2">
      <MemberAccountCard name={user.displayName ?? ""} email={user.email ?? ""} photoUrl={user.photoURL} />
      <SignInSecurityCard user={user} />
    </div>
    <section className="space-y-3" aria-labelledby="privacy-settings-heading">
      <div><h2 id="privacy-settings-heading" className="text-lg font-semibold">Privacy and discovery</h2><p className="mt-1 text-sm text-muted-foreground">Your email and account settings stay private. You control whether your professional profile and reputation are shared.</p></div>
      {loading ? <div className="h-40 animate-pulse rounded-2xl bg-muted" role="status" aria-label="Loading privacy settings" /> : loadError ? <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{loadError}</p> : <SettingsPrivacyCard directoryVisible={directoryVisible} leaderboardVisible={leaderboardVisible} />}
    </section>
  </main>;
}
