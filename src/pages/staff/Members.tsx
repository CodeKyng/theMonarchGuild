import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { RefreshCw, UsersRound } from "lucide-react";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import MemberProfileDialog from "@/components/member/explore-members/MemberProfileDialog";
import StaffMemberDirectory from "@/components/staff/members/StaffMemberDirectory";
import StaffMemberPrivacyNote from "@/components/staff/members/StaffMemberPrivacyNote";
import StaffMemberSummary from "@/components/staff/members/StaffMemberSummary";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { return typeof value === "string" ? value : ""; }
function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}
function profileFromDocument(id: string, data: Record<string, unknown>): PublicMemberProfile {
  return {
    id,
    displayName: stringValue(data.displayName).trim() || "Guild member",
    professionalTitle: stringValue(data.professionalTitle),
    workType: stringValue(data.workType).trim(),
    experienceYears: stringValue(data.experienceYears),
    skills: stringList(data.skills),
    location: stringValue(data.location),
    bio: stringValue(data.bio),
    interests: stringValue(data.interests),
    websiteUrl: stringValue(data.websiteUrl),
    linkedinUrl: stringValue(data.linkedinUrl),
    githubUrl: stringValue(data.githubUrl),
    twitterUrl: stringValue(data.twitterUrl),
  };
}

export default function StaffMembers() {
  const [members, setMembers] = useState<PublicMemberProfile[]>([]);
  const [selectedMember, setSelectedMember] = useState<PublicMemberProfile | null>(null);
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, "publicProfiles"));
      const rows = snapshot.docs.map((entry) => profileFromDocument(entry.id, entry.data())).sort((a, b) => a.displayName.localeCompare(b.displayName));
      setMembers(rows);
      setSelectedMember((current) => current ? rows.find((member) => member.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load staff member directory:", loadError);
      setError("Member profiles could not be loaded. Check your connection and permissions, then try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);

  const workTypes = useMemo(() => Array.from(new Set(members.map((member) => member.workType.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [members]);
  const filteredMembers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesText = !needle || [member.displayName, member.professionalTitle, member.workType, member.skills.join(" "), member.location, member.interests, member.bio].some((value) => value.toLowerCase().includes(needle));
      return matchesText && (workType === "all" || member.workType === workType);
    });
  }, [members, search, workType]);

  function clearFilters() { setSearch(""); setWorkType("all"); }

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><UsersRound className="size-4" aria-hidden="true" />Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Members</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Get to know the people, skills, and experience that make up the guild.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh directory</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}
    <StaffMemberSummary members={members} loading={loading} />
    <StaffMemberDirectory members={filteredMembers} allMembers={members} workTypes={workTypes} loading={loading} search={search} workType={workType} onSearch={setSearch} onWorkType={setWorkType} onClear={clearFilters} onView={setSelectedMember} />
    <StaffMemberPrivacyNote />
    <MemberProfileDialog member={selectedMember} onClose={() => setSelectedMember(null)} />
  </div>;
}
