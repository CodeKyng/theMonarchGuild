import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ArrowRight, RefreshCw, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import MemberQuickLinks from "@/components/member/MemberQuickLinks";
import MemberUpcomingEvents from "@/components/member/MemberUpcomingEvents";
import MemberWelcome from "@/components/member/MemberWelcome";
import type { MemberResource } from "@/components/member/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/firebase";

function textValue(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null { if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value; if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; } if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; } return null; }

export default function MemberDashboard() {
  const { user } = useAuth(); const [name, setName] = useState(""); const [profileProgress, setProfileProgress] = useState<number | null>(null);
  const [events, setEvents] = useState<MemberResource[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    const [profileResult, eventsResult] = await Promise.allSettled([getDoc(doc(db, "users", user.uid)), getDocs(collection(db, "events"))]);
    if (profileResult.status === "fulfilled" && profileResult.value.exists()) {
      const profile = profileResult.value.data(); const displayName = textValue(profile.displayName) || user.displayName || ""; setName(displayName.split(" ")[0]);
      const completed = [profile.professionalTitle, profile.workType, profile.experienceYears, profile.skills, profile.location].filter((value) => typeof value === "string" && value.trim()).length;
      setProfileProgress(Math.round((completed / 5) * 100));
    } else { setName(user.displayName?.split(" ")[0] ?? ""); setProfileProgress(null); }
    if (eventsResult.status === "fulfilled") {
      const now = new Date();
      const upcoming = eventsResult.value.docs.map((entry) => { const data = entry.data(); return { id: entry.id, title: textValue(data.title) || "Guild event", description: textValue(data.description), category: textValue(data.category), owner: textValue(data.host), status: textValue(data.status), date: readDate(data.date), link: textValue(data.registrationUrl) || textValue(data.url), meta: textValue(data.venue) || textValue(data.location) } satisfies MemberResource; }).filter((event) => !event.date || event.date >= now).sort((a, b) => (a.date?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.date?.getTime() ?? Number.MAX_SAFE_INTEGER));
      setEvents(upcoming);
    } else { setEvents([]); setError("Upcoming events could not be loaded right now."); }
    setLoading(false);
  }, [user]);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  return <div className="space-y-7"><MemberWelcome name={name} />
    <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"><MemberQuickLinks /><Card className="border-border/70 shadow-sm"><CardContent className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><UserRound className="size-4 text-primary" aria-hidden="true" /><h2 className="font-semibold">Your member profile</h2></div><Button type="button" variant="ghost" size="icon" aria-label="Refresh member overview" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /></Button></div><p className="mt-2 text-sm leading-6 text-muted-foreground">A clear profile helps guild members and teams understand what you do and how to collaborate with you.</p>{profileProgress !== null && <><div className="mt-5 flex items-center justify-between text-xs"><span className="font-medium">Job profile completion</span><span className="text-muted-foreground">{profileProgress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${profileProgress}%` }} /></div></>}<Link to="/member/profile" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">{profileProgress === 100 ? "View your profile" : "Complete your profile"}<ArrowRight className="size-4" aria-hidden="true" /></Link></CardContent></Card></section>
    {error && <p role="status" className="text-sm text-muted-foreground">{error}</p>}
    <MemberUpcomingEvents events={events} loading={loading} />
  </div>;
}
