import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { BriefcaseBusiness, ExternalLink, LoaderCircle, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/firebase";

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: Date | null;
  professionalTitle: string;
  workType: string;
  experienceYears: string;
  skills: string;
  location: string;
  bio: string;
  interests: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  discordHandle: string;
}

const socialLinks: { label: string; field: "websiteUrl" | "linkedinUrl" | "githubUrl" | "twitterUrl" }[] = [
  { label: "Portfolio", field: "websiteUrl" },
  { label: "LinkedIn", field: "linkedinUrl" },
  { label: "GitHub", field: "githubUrl" },
  { label: "X / Twitter", field: "twitterUrl" },
];

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default function AdminUserDetails({
  user,
  currentUserId,
  onClose,
  onRoleChanged,
}: {
  user: AdminUser | null;
  currentUserId: string;
  onClose: () => void;
  onRoleChanged: (id: string, role: string) => void;
}) {
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function changeRole(role: string) {
    if (!user || role === user.role) return;
    setSavingRole(true);
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "users", user.id), { role });
      onRoleChanged(user.id, role);
      setSuccess(`Role updated to ${role}.`);
    } catch (saveError) {
      console.error("Failed to update user role:", saveError);
      setError("Could not update this role. Please try again.");
    } finally {
      setSavingRole(false);
    }
  }

  const initials = (user?.displayName || user?.email || "?").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  const validatedSocialLinks = user
    ? socialLinks.flatMap(({ label, field }) => {
        const href = safeHttpUrl(user[field]);
        return href ? [{ label, field, href }] : [];
      })
    : [];

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        {user && <>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-12"><AvatarFallback className="bg-amber-400/15 font-semibold text-amber-800 dark:text-amber-200">{initials}</AvatarFallback></Avatar>
              <div className="min-w-0"><DialogTitle className="truncate">{user.displayName || "Guild member"}</DialogTitle><DialogDescription className="truncate">{user.email || "No email listed"}</DialogDescription></div>
            </div>
          </DialogHeader>

          <ScrollArea orientation="vertical" className="h-[65svh] min-h-48 max-h-[42rem] w-full">
            <div className="space-y-5 pr-3">
          <Card className="border-border/70 shadow-none"><CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            <div className="min-w-0"><p className="text-xs text-muted-foreground">Professional focus</p><p className="mt-1 break-words font-medium">{user.professionalTitle || "Not provided"}</p></div>
            <div><p className="text-xs text-muted-foreground">Work type</p><p className="mt-1 font-medium capitalize">{user.workType || "Not provided"}</p></div>
            <div><p className="text-xs text-muted-foreground">Experience</p><p className="mt-1 font-medium">{user.experienceYears ? `${user.experienceYears} ${Number(user.experienceYears) === 1 ? "year" : "years"}` : "Not provided"}</p></div>
          </CardContent></Card>

          <section className="space-y-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><BriefcaseBusiness className="size-4 text-primary" />Guild profile</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/45 p-3"><p className="text-xs text-muted-foreground">Skills</p><p className="mt-1 break-words whitespace-pre-wrap text-sm">{user.skills || "Not provided"}</p></div>
              <div className="rounded-xl bg-muted/45 p-3"><p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" />Location / time zone</p><p className="mt-1 break-words text-sm">{user.location || "Not provided"}</p></div>
              <div className="rounded-xl bg-muted/45 p-3 sm:col-span-2"><p className="text-xs text-muted-foreground">About</p><p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6">{user.bio || "No introduction added yet."}</p></div>
              {user.interests && <div className="rounded-xl bg-muted/45 p-3 sm:col-span-2"><p className="text-xs text-muted-foreground">Interests</p><p className="mt-1 break-words text-sm">{user.interests}</p></div>}
            </div>
          </section>

          <section className="space-y-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><UsersRound className="size-4 text-primary" />Community links</h3>
            <div className="flex flex-wrap gap-2">
              {validatedSocialLinks.map(({ label, field, href }) => <a key={field} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted">{label}<ExternalLink className="size-3.5" /></a>)}
              {user.discordHandle && <span className="max-w-full break-all rounded-full bg-muted px-3 py-1.5 text-sm">Discord: {user.discordHandle}</span>}
              {validatedSocialLinks.length === 0 && !user.discordHandle && <p className="text-sm text-muted-foreground">No social links added.</p>}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" />Workspace access</h3><p className="mt-1 text-xs text-muted-foreground">Choose the workspace role for this account.</p></div>
            <Select value={["member", "staff", "admin"].includes(user.role) ? user.role : null} onValueChange={(value) => { if (value) void changeRole(value); }} disabled={savingRole || user.id === currentUserId}>
              <SelectTrigger aria-label="User workspace role" className="w-full capitalize sm:w-36"><SelectValue placeholder="Choose role" /></SelectTrigger>
              <SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="staff">Staff</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
          </section>
          {user.id === currentUserId && <p className="text-xs text-muted-foreground">You can’t change your own role here.</p>}
          {savingRole && <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Updating access…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {success && <p role="status" className="text-sm text-emerald-600">{success}</p>}
            </div>
          </ScrollArea>
        </>}
      </DialogContent>
    </Dialog>
  );
}
