import { useEffect, useMemo, useState, type FormEvent } from "react";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { ArrowLeft, BriefcaseBusiness, Check, CircleUserRound, LoaderCircle, MapPin, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EditProfile, type ProfileData } from "@/components/editprofile";
import { db } from "@/firebase";
import { Globe, Pencil, ExternalLink } from "lucide-react";
import DirectoryVisibilityControl from "@/components/member/explore-members/DirectoryVisibilityControl";

const emptyProfile: ProfileData = {
  displayName: "", professionalTitle: "", workType: "", experienceYears: "",
  skills: "", location: "", bio: "", interests: "", websiteUrl: "",
  linkedinUrl: "", githubUrl: "", twitterUrl: "", discordHandle: "",
};

const profileFields: (keyof ProfileData)[] = Object.keys(emptyProfile) as (keyof ProfileData)[];
const requiredFields: (keyof ProfileData)[] = ["professionalTitle", "workType", "experienceYears", "skills", "location"];

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function validOptionalUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function Account() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({ ...emptyProfile, displayName: user?.displayName ?? "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [directoryVisible, setDirectoryVisible] = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.data() ?? {};
        setDirectoryVisible(data.showInMemberDirectory === true);
        setLeaderboardVisible(data.showOnLeaderboard === true);
        setProfile(Object.fromEntries(profileFields.map((field) => [field, field === "displayName" ? textValue(data[field]) || user.displayName || "" : textValue(data[field])])) as unknown as ProfileData);
      })
      .catch((error) => {
        console.error("Failed to load account profile:", error);
        if (active) setFeedback({ type: "error", message: "We couldn't load your profile details. Refresh and try again." });
      })
      .finally(() => { if (active) setLoadingProfile(false); });
    return () => { active = false; };
  }, [user]);

  const completion = useMemo(() => {
    const completed = requiredFields.filter((field) => profile[field].trim()).length;
    return Math.round((completed / requiredFields.length) * 100);
  }, [profile]);

  if (!user) return null;
  const authenticatedUser = user;

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  }

  async function persistProfile(cleanProfile: ProfileData, showInDirectory: boolean) {
    if (!cleanProfile.displayName || cleanProfile.displayName.length > 100) {
      throw new Error("Enter a display name between 1 and 100 characters.");
    }
    if (!cleanProfile.professionalTitle || !cleanProfile.workType || !cleanProfile.experienceYears || !cleanProfile.skills || !cleanProfile.location) {
      throw new Error("Complete the required job and experience details to finish onboarding.");
    }
    const experienceYears = Number(cleanProfile.experienceYears);
    if (!Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 80) {
      throw new Error("Experience must be between 0 and 80 years.");
    }
    const urls = [cleanProfile.websiteUrl, cleanProfile.linkedinUrl, cleanProfile.githubUrl, cleanProfile.twitterUrl];
    if (!urls.every(validOptionalUrl)) {
      throw new Error("Social and portfolio links must be valid http or https URLs.");
    }

    setSaving(true);
    setFeedback(null);
    try {
      const userRef = doc(db, "users", authenticatedUser.uid);
      const currentUserSnapshot = await getDoc(userRef);
      const currentUserData = currentUserSnapshot.data() ?? {};
      const currentPoints = typeof currentUserData.reputationPoints === "number" && Number.isFinite(currentUserData.reputationPoints) ? Math.max(0, Math.floor(currentUserData.reputationPoints)) : 0;
      const balanceRef = doc(db, "socialTaskBalances", authenticatedUser.uid);
      const publicRef = doc(db, "publicProfiles", authenticatedUser.uid);
      const batch = writeBatch(db);
      batch.update(userRef, { ...cleanProfile, showInMemberDirectory: showInDirectory });
      batch.set(balanceRef, {
        points: currentPoints,
        displayName: cleanProfile.displayName,
        showOnLeaderboard: currentUserData.showOnLeaderboard === true,
        updatedAt: serverTimestamp(),
      });
      if (showInDirectory) {
        const { displayName, professionalTitle, workType, experienceYears, skills, location, bio, interests, websiteUrl, linkedinUrl, githubUrl, twitterUrl } = cleanProfile;
        batch.set(publicRef, { displayName, professionalTitle, workType, experienceYears, skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean), location, bio, interests, websiteUrl, linkedinUrl, githubUrl, twitterUrl, updatedAt: serverTimestamp() });
      } else {
        batch.delete(publicRef);
      }
      if (leaderboardVisible) {
        batch.set(doc(db, "publicLeaderboard", authenticatedUser.uid), { displayName: cleanProfile.displayName, points: currentPoints, updatedAt: serverTimestamp() });
      }
      await batch.commit();
      if (cleanProfile.displayName !== (authenticatedUser.displayName ?? "")) {
        await updateProfile(authenticatedUser, { displayName: cleanProfile.displayName });
      }
      setProfile(cleanProfile);
      setDirectoryVisible(showInDirectory);
    } catch (error) {
      console.error("Failed to update account:", error);
      throw new Error("We couldn't save your profile. Please try again.", { cause: error });
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanProfile = Object.fromEntries(profileFields.map((field) => [field, profile[field].trim()])) as unknown as ProfileData;
    setSaving(true);
    setFeedback(null);
    try {
      await persistProfile(cleanProfile, directoryVisible);
      setFeedback({ type: "success", message: "Your profile is saved. Welcome to the guild!" });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "We couldn't save your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleModalSave(data: ProfileData, showInDirectory: boolean) {
    const cleanProfile = Object.fromEntries(profileFields.map((field) => [field, data[field].trim()])) as unknown as ProfileData;
    setFeedback(null);
    await persistProfile(cleanProfile, showInDirectory);
    setFeedback({ type: "success", message: "Your profile changes have been saved." });
  }

  const initials = (user.displayName || user.email || "A").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  const input = (field: keyof ProfileData, label: string, placeholder: string, options: { type?: string; required?: boolean; maxLength?: number } = {}) => (
    <div className="space-y-2" key={field}>
      <Label htmlFor={`profile-${field}`}>{label}{options.required && <span className="text-primary"> *</span>}</Label>
      <Input id={`profile-${field}`} type={options.type ?? "text"} value={profile[field]} onChange={(event) => updateField(field, event.target.value)} placeholder={placeholder} required={options.required} maxLength={options.maxLength ?? 180} />
    </div>
  );

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl space-y-7">
      <Link to={role ? `/${role}` : "/"} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Back to workspace</Link>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Your Guild profile</p>
          <h1 className="text-3xl font-semibold tracking-tight">{completion === 100 ? "Your Guild profile" : "Tell the community what you do"}</h1>
          <p className="max-w-2xl text-muted-foreground">{completion === 100 ? "Your experience, skills, and community links in one place." : "Share your skills and experience so Web3 teams and fellow builders can find you and grow together."}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 sm:min-w-52">
          <Avatar className="size-12"><AvatarImage src={user.photoURL || undefined} alt={user.displayName || ""} /><AvatarFallback>{initials || <CircleUserRound />}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="truncate font-medium">{profile.displayName || user.email}</p><p className="text-xs capitalize text-muted-foreground">{role ?? "Member"} account</p></div>
        </div>
      </header>

      <Card className="border-primary/15 bg-primary/[0.03]">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-medium">Profile setup</p><p className="text-sm text-muted-foreground">{completion === 100 ? "Your core professional details are complete." : "Complete the required details to finish introducing yourself."}</p></div>
          <div className="flex items-center gap-3"><div className="h-2 w-36 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div><span className="text-sm font-medium">{completion}%</span></div>
        </CardContent>
      </Card>

      {loadingProfile ? <div className="flex items-center gap-2 py-12 text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading your profile…</div> : completion === 100 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1"><CardTitle className="break-words text-xl">{profile.displayName}</CardTitle><CardDescription className="break-words">{profile.professionalTitle} · {profile.workType}</CardDescription></div>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setEditOpen(true)}><Pencil className="size-4" />Edit profile</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-medium text-muted-foreground">Experience</p><p className="mt-1 font-medium">{profile.experienceYears} {Number(profile.experienceYears) === 1 ? "year" : "years"}</p></div>
                <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-medium text-muted-foreground">Location / time zone</p><p className="mt-1 break-words font-medium">{profile.location}</p></div>
                <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-medium text-muted-foreground">Account email</p><p className="mt-1 break-all font-medium">{user.email || "Not available"}</p></div>
              </div>
              <div className="space-y-2"><h2 className="text-sm font-semibold">Skills</h2><div className="flex flex-wrap gap-2">{profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => <span key={skill} className="max-w-full break-words rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{skill}</span>)}</div></div>
              {profile.bio && <div className="space-y-2"><h2 className="text-sm font-semibold">About</h2><p className="break-words whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{profile.bio}</p></div>}
              {profile.interests && <div className="space-y-2"><h2 className="text-sm font-semibold">Web3 interests</h2><p className="text-sm text-muted-foreground">{profile.interests}</p></div>}
              <div className="space-y-3 border-t border-border pt-5"><h2 className="flex items-center gap-2 text-sm font-semibold"><Globe className="size-4 text-primary" />Social & portfolio links</h2><div className="flex flex-wrap gap-2">
                {([
                  ["Portfolio", profile.websiteUrl], ["LinkedIn", profile.linkedinUrl], ["GitHub", profile.githubUrl], ["X / Twitter", profile.twitterUrl],
                ] as const).filter(([, href]) => href).map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted">{label}<ExternalLink className="size-3.5" /></a>)}
                {profile.discordHandle && <span className="max-w-full break-all rounded-full bg-muted px-3 py-1.5 text-sm">Discord: {profile.discordHandle}</span>}
                {!profile.websiteUrl && !profile.linkedinUrl && !profile.githubUrl && !profile.twitterUrl && !profile.discordHandle && <span className="text-sm text-muted-foreground">No links added yet.</span>}
              </div></div>
            </CardContent>
          </Card>
          {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={feedback.type === "error" ? "text-sm text-destructive" : "text-sm text-emerald-600"}>{feedback.message}</p>}
          <div className="space-y-3 rounded-2xl border border-border p-4"><DirectoryVisibilityControl checked={directoryVisible} onChange={setDirectoryVisible} disabled={saving} /><div className="flex justify-end"><Button type="button" variant="outline" onClick={() => void handleModalSave(profile, directoryVisible).then(() => setFeedback({ type: "success", message: "Directory visibility saved." })).catch((error) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Could not update directory visibility." }))} disabled={saving}>{saving ? "Saving…" : "Save visibility"}</Button></div></div>
          {editOpen && <EditProfile isOpen onClose={() => setEditOpen(false)} initialData={profile} initialDirectoryVisible={directoryVisible} email={user.email ?? ""} role={role ?? "member"} onSave={handleModalSave} />}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><div className="flex items-center gap-2"><BriefcaseBusiness className="size-5 text-primary" /><CardTitle>About your work</CardTitle></div><CardDescription>Help people understand your role, experience, and strengths.</CardDescription></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              {input("displayName", "Display name", "How should we address you?", { required: true, maxLength: 100 })}
              <div className="space-y-2"><Label htmlFor="profile-email">Email address</Label><Input id="profile-email" value={user.email ?? ""} readOnly disabled /><p className="text-xs text-muted-foreground">Used for sign-in and account notices.</p></div>
              {input("professionalTitle", "What do you do?", "e.g. Smart contract developer", { required: true })}
              <div className="space-y-2"><Label>Work type <span className="text-primary">*</span></Label><Select value={profile.workType || null} onValueChange={(value) => updateField("workType", value ?? "")}><SelectTrigger aria-label="Work type" className="w-full"><SelectValue placeholder="Choose your focus" /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Freelance">Freelance</SelectItem><SelectItem value="Founder">Founder</SelectItem><SelectItem value="Student">Student</SelectItem><SelectItem value="Looking for opportunities">Looking for opportunities</SelectItem></SelectContent></Select></div>
              {input("experienceYears", "Years in Web3 / your field", "0", { type: "number", required: true })}
              {input("location", "Location or time zone", "e.g. Lagos, WAT / UTC+1", { required: true })}
              <div className="space-y-2 md:col-span-2"><Label htmlFor="profile-skills">Skills <span className="text-primary">*</span></Label><Input id="profile-skills" value={profile.skills} onChange={(event) => updateField("skills", event.target.value)} placeholder="Solidity, community management, design…" required maxLength={500} /><p className="text-xs text-muted-foreground">Separate skills with commas.</p></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="profile-bio">A little about you</Label><Textarea id="profile-bio" value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder="What are you building, learning, or hoping to contribute?" maxLength={1000} className="min-h-28 resize-y" /><p className="text-xs text-muted-foreground">{profile.bio.length}/1000 characters</p></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="profile-interests">Web3 interests</Label><Input id="profile-interests" value={profile.interests} onChange={(event) => updateField("interests", event.target.value)} placeholder="DeFi, NFTs, DAOs, gaming…" maxLength={500} /></div>
            </CardContent>
          </Card>

          <DirectoryVisibilityControl checked={directoryVisible} onChange={setDirectoryVisible} disabled={saving} />

          <Card>
            <CardHeader><div className="flex items-center gap-2"><UsersRound className="size-5 text-primary" /><CardTitle>Connect with the community</CardTitle></div><CardDescription>Add links you’re comfortable sharing. All links are optional.</CardDescription></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              {input("websiteUrl", "Portfolio or website", "https://your-site.com", { type: "url" })}
              {input("linkedinUrl", "LinkedIn profile", "https://linkedin.com/in/you", { type: "url" })}
              {input("githubUrl", "GitHub profile", "https://github.com/you", { type: "url" })}
              {input("twitterUrl", "X / Twitter profile", "https://x.com/you", { type: "url" })}
              <div className="space-y-2 md:col-span-2"><Label htmlFor="profile-discordHandle">Discord username</Label><Input id="profile-discordHandle" value={profile.discordHandle} onChange={(event) => updateField("discordHandle", event.target.value)} placeholder="yourname" maxLength={100} /></div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" /><span>You choose what to share. Your email remains private on your account.</span></div>
            <div className="flex items-center gap-3">
              {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={feedback.type === "error" ? "text-sm text-destructive" : "text-sm text-emerald-600"}>{feedback.message}</p>}
              <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" /> : <Check />}{saving ? "Saving…" : completion === 100 ? "Save profile" : "Save & finish setup"}</Button>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}
