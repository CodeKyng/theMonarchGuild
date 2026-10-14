import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DirectoryHeader from "@/components/member/explore-members/DirectoryHeader";
import MemberDirectory from "@/components/member/explore-members/MemberDirectory";
import MemberDirectoryPrivacyNote from "@/components/member/explore-members/MemberDirectoryPrivacyNote";
import MemberProfileDialog from "@/components/member/explore-members/MemberProfileDialog";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import { db } from "@/firebase";

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asSkills(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

export default function ExploreMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<PublicMemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("all");
  const [selectedMember, setSelectedMember] = useState<PublicMemberProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "publicProfiles"), (snapshot) => {
      const results = snapshot.docs.map((profileDoc) => {
        const data = profileDoc.data();
        return {
          id: profileDoc.id,
          displayName: asText(data.displayName),
          professionalTitle: asText(data.professionalTitle),
          workType: asText(data.workType),
          experienceYears: asText(data.experienceYears),
          skills: asSkills(data.skills),
          location: asText(data.location),
          bio: asText(data.bio),
          interests: asText(data.interests),
          websiteUrl: asText(data.websiteUrl),
          linkedinUrl: asText(data.linkedinUrl),
          githubUrl: asText(data.githubUrl),
          twitterUrl: asText(data.twitterUrl),
        } satisfies PublicMemberProfile;
      }).filter((member) => member.id !== user?.uid && member.displayName.trim());
      setMembers(results);
      setError("");
      setLoading(false);
    }, (snapshotError) => {
      console.error("Failed to load member directory:", snapshotError);
      setError("The member directory couldn't be loaded right now. Please try again later.");
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.uid]);

  const workTypes = useMemo(() => [...new Set(members.map((member) => member.workType).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [members]);
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return members.filter((member) => {
      if (workType !== "all" && member.workType !== workType) return false;
      if (!query) return true;
      const searchable = [member.displayName, member.professionalTitle, member.workType, member.location, member.bio, member.interests, ...member.skills].join(" ").toLocaleLowerCase();
      return searchable.includes(query);
    }).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [members, search, workType]);

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6"><DirectoryHeader />{error && <div role="alert" className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" /><div><p className="font-semibold text-destructive">Directory unavailable</p><p className="mt-1 text-muted-foreground">{error}</p></div></div>}<MemberDirectory members={filteredMembers} workTypes={workTypes} search={search} workType={workType} loading={loading} onSearch={setSearch} onWorkType={setWorkType} onView={setSelectedMember} />{loading && <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin" />Syncing member profiles</p>}<MemberDirectoryPrivacyNote /><MemberProfileDialog member={selectedMember} onClose={() => setSelectedMember(null)} /></main>;
}
