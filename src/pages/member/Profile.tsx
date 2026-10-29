import { useEffect, useMemo, useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { BriefcaseBusiness, Clock3, Globe2, LoaderCircle, Mail, MapPin, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { EditProfile, type ProfileData } from "@/components/editprofile";
import ProfileHero from "@/components/member/profile/ProfileHero";
import ProfileLinks from "@/components/member/profile/ProfileLinks";
import ProfileSection from "@/components/member/profile/ProfileSection";
import ProfileSkills from "@/components/member/profile/ProfileSkills";
import { Button } from "@/components/ui/button";
import ConnectWallet from "@/components/ConnectWallet";
import { db } from "@/firebase";

const emptyProfile: ProfileData = { displayName: "", professionalTitle: "", workType: "", experienceYears: "", skills: "", location: "", bio: "", interests: "", websiteUrl: "", linkedinUrl: "", githubUrl: "", twitterUrl: "", discordHandle: "" };
const fields = Object.keys(emptyProfile) as (keyof ProfileData)[];
function asText(value: unknown) { return typeof value === "string" ? value : ""; }

export default function MemberProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [directoryVisible, setDirectoryVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      const data = snapshot.data() ?? {};
      setProfile(Object.fromEntries(fields.map((field) => [field, field === "displayName" ? asText(data[field]) || user.displayName || "" : asText(data[field])])) as unknown as ProfileData);
      setDirectoryVisible(data.showInMemberDirectory === true);
      setLoading(false);
      setFeedback(null);
    }, (error) => {
      console.error("Failed to load member profile:", error);
      setFeedback({ type: "error", message: "Your profile could not be loaded. Check your connection and try again." });
      setLoading(false);
    });
  }, [user]);

  const completion = useMemo(() => {
    const required: (keyof ProfileData)[] = ["displayName", "professionalTitle", "workType", "experienceYears", "skills", "location"];
    return Math.round(required.filter((field) => profile[field].trim()).length / required.length * 100);
  }, [profile]);

  if (!user) return null;
  const authenticatedUser = user;

  async function saveProfile(data: ProfileData, showInDirectory: boolean) {
    const clean = Object.fromEntries(fields.map((field) => [field, data[field].trim()])) as unknown as ProfileData;
    if (!clean.displayName || !clean.professionalTitle || !clean.workType || !clean.experienceYears || !clean.skills || !clean.location) throw new Error("Complete your name, work, experience, skills, and location fields.");
    if (!Number.isFinite(Number(clean.experienceYears)) || Number(clean.experienceYears) < 0 || Number(clean.experienceYears) > 80) throw new Error("Experience must be between 0 and 80 years.");
    for (const value of [clean.websiteUrl, clean.linkedinUrl, clean.githubUrl, clean.twitterUrl]) {
      if (!value) continue;
      try { const url = new URL(value); if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(); }
      catch { throw new Error("Portfolio and social links must be valid http or https URLs."); }
    }
    setFeedback(null);
    try {
      const userRef = doc(db, "users", authenticatedUser.uid);
      const currentSnapshot = await getDoc(userRef);
      const current = currentSnapshot.data() ?? {};
      const balanceRef = doc(db, "socialTaskBalances", authenticatedUser.uid);
      const batch = writeBatch(db);
      batch.update(userRef, { ...clean, showInMemberDirectory: showInDirectory });
      batch.set(balanceRef, {
        points: typeof current.reputationPoints === "number" ? Math.max(0, current.reputationPoints) : 0,
        displayName: clean.displayName,
        showOnLeaderboard: current.showOnLeaderboard === true,
        updatedAt: serverTimestamp(),
      });
      const publicRef = doc(db, "publicProfiles", authenticatedUser.uid);
      if (showInDirectory) {
        batch.set(publicRef, { displayName: clean.displayName, professionalTitle: clean.professionalTitle, workType: clean.workType, experienceYears: clean.experienceYears, skills: clean.skills.split(",").map((skill) => skill.trim()).filter(Boolean), location: clean.location, bio: clean.bio, interests: clean.interests, websiteUrl: clean.websiteUrl, linkedinUrl: clean.linkedinUrl, githubUrl: clean.githubUrl, twitterUrl: clean.twitterUrl, updatedAt: serverTimestamp() });
      } else batch.delete(publicRef);
      if (current.showOnLeaderboard === true) {
        const points = typeof current.reputationPoints === "number" ? Math.max(0, current.reputationPoints) : 0;
        batch.set(doc(db, "publicLeaderboard", authenticatedUser.uid), { displayName: clean.displayName, points, updatedAt: serverTimestamp() });
      }
      await batch.commit();
      if (clean.displayName !== (authenticatedUser.displayName ?? "")) await updateProfile(authenticatedUser, { displayName: clean.displayName });
      setProfile(clean); setDirectoryVisible(showInDirectory); setFeedback({ type: "success", message: "Your profile has been updated." });
    } catch (error) {
      console.error("Failed to save member profile:", error);
      throw new Error(error instanceof Error && error.message !== "" ? error.message : "Your changes could not be saved. Try again.");
    }
  }

  const experience = profile.experienceYears ? `${profile.experienceYears} ${Number(profile.experienceYears) === 1 ? "year" : "years"}` : "Add experience";
  return <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-primary">Your corner of the Guild</p><p className="mt-1 text-sm text-muted-foreground">Show people what you do, what you’re learning, and how to connect.</p></div><Link to="/member/account" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Account & onboarding</Link></div>
    {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><LoaderCircle className="size-4 animate-spin" />Loading your profile…</div> : <>
      <ProfileHero name={profile.displayName || user.displayName || "Guild member"} title={profile.professionalTitle} workType={profile.workType} location={profile.location} photoUrl={user.photoURL} completion={completion} onEdit={() => setEditOpen(true)} />
      {completion < 100 && <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-semibold">Finish setting up your member profile</h2><p className="mt-1 text-sm text-muted-foreground">Add your work and skills so other builders can understand where you fit.</p></div><Button type="button" variant="outline" onClick={() => setEditOpen(true)}>Complete profile</Button></section>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.8fr)]">
        <div className="space-y-4"><ProfileSection title="About me" icon={<UserRound className="size-4" />}><p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{profile.bio || "Add a short introduction about what you’re building, learning, or hoping to contribute."}</p></ProfileSection><ProfileSection title="Skills & interests" icon={<Sparkles className="size-4" />}><ProfileSkills profile={profile} /></ProfileSection></div>
        <div className="space-y-4"><ProfileSection title="Work snapshot" icon={<BriefcaseBusiness className="size-4" />}><dl className="space-y-4"><div className="flex gap-3"><BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Work type</dt><dd className="mt-0.5 text-sm font-medium">{profile.workType || "Not added"}</dd></div></div><div className="flex gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Experience</dt><dd className="mt-0.5 text-sm font-medium">{experience}</dd></div></div><div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Location / time zone</dt><dd className="mt-0.5 break-words text-sm font-medium">{profile.location || "Not added"}</dd></div></div><div className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Account email · private</dt><dd className="mt-0.5 break-all text-sm font-medium">{user.email || "Unavailable"}</dd></div></div></dl></ProfileSection><ProfileSection title="Find me online" icon={<Globe2 className="size-4" />}><ProfileLinks profile={profile} /></ProfileSection></div>
      </div>
      <ConnectWallet />
      {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${feedback.type === "error" ? "bg-destructive/5 text-destructive" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{feedback.message}</p>}
      <p className="text-center text-xs leading-5 text-muted-foreground">{directoryVisible ? "Your professional details are visible to signed-in members in Explore Members. Your email stays private." : "Your profile is private in Explore Members. Choose directory visibility in Edit profile when you’re ready to connect."}</p>
    </>}
    {editOpen && <EditProfile isOpen onClose={() => setEditOpen(false)} initialData={profile} initialDirectoryVisible={directoryVisible} email={user.email ?? ""} role="member" onSave={saveProfile} />}
  </main>;
}
