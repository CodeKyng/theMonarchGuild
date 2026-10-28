import { useState } from "react";
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { Award, LoaderCircle } from "lucide-react";
import type { ReputationMember, RewardDraft } from "@/components/admin/reputation-rewards/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";

const categories = ["Community contribution", "Project work", "Learning", "Mentorship", "Event participation", "Other"];
export default function AwardContributionDialog({ open, members, initialMember, onClose, onAwarded }: { open: boolean; members: ReputationMember[]; initialMember: ReputationMember | null; onClose: () => void; onAwarded: (draft: RewardDraft) => void }) {
  const [memberId, setMemberId] = useState(initialMember?.id ?? "");
  const [title, setTitle] = useState(""); const [category, setCategory] = useState(categories[0]); const [points, setPoints] = useState("25"); const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function submit() {
    const member = members.find((person) => person.id === memberId);
    const amount = Number(points);
    if (!member) { setError("Choose a member to recognize."); return; }
    if (!title.trim()) { setError("Add a short description of the contribution."); return; }
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000) { setError("Points must be a whole number from 1 to 10,000."); return; }
    setSaving(true); setError("");
    const rewardRef = doc(collection(db, "reputationRewards")); const memberRef = doc(db, "users", member.id); const leaderboardRef = doc(db, "publicLeaderboard", member.id); const balanceRef = doc(db, "socialTaskBalances", member.id); const notificationRef = doc(collection(db, "users", member.id, "notifications"));
    try {
      await runTransaction(db, async (transaction) => {
        const memberSnapshot = await transaction.get(memberRef);
        const leaderboardSnapshot = await transaction.get(leaderboardRef);
        if (!memberSnapshot.exists()) throw new Error("Member account no longer exists.");
        const memberData = memberSnapshot.data();
        const current = memberData.reputationPoints;
        const currentPoints = typeof current === "number" && Number.isFinite(current) ? current : 0;
        transaction.update(memberRef, { reputationPoints: currentPoints + amount, reputationUpdatedAt: serverTimestamp() });
        transaction.set(balanceRef, {
          points: currentPoints + amount,
          displayName: typeof memberData.displayName === "string" ? memberData.displayName : member.name,
          showOnLeaderboard: memberData.showOnLeaderboard === true,
          updatedAt: serverTimestamp(),
        });
        if (memberData.showOnLeaderboard === true) {
          transaction.set(leaderboardRef, { displayName: typeof memberData.displayName === "string" ? memberData.displayName : member.name, points: currentPoints + amount, updatedAt: serverTimestamp() });
        } else if (leaderboardSnapshot.exists()) {
          transaction.delete(leaderboardRef);
        }
        transaction.set(rewardRef, { userId: member.id, memberName: member.name, memberEmail: member.email, title: title.trim(), category, points: amount, note: note.trim(), awardedBy: "admin", createdAt: serverTimestamp() });
        transaction.set(notificationRef, { type: "reputation", title: "Contribution recognized", body: `${title.trim()} · +${amount.toLocaleString()} reputation points`, href: "/member/leaderboard", actorName: "The Monarch Guild", sourceId: rewardRef.id, createdAt: serverTimestamp(), readAt: null });
      });
      onAwarded({ member, title: title.trim(), category, points: amount, note: note.trim() }); onClose();
    } catch (saveError) {
      console.error("Failed to award reputation points:", saveError);
      setError(saveError instanceof Error && saveError.message === "Member account no longer exists." ? saveError.message : "The award could not be saved. Check your connection and permissions, then try again.");
    } finally { setSaving(false); }
  }
  return <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !saving) onClose(); }}><DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="size-5 text-amber-500" aria-hidden="true" />Recognize a contribution</DialogTitle><DialogDescription>Award points for a specific, meaningful contribution to the guild.</DialogDescription></DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2"><Label>Member</Label><Select value={memberId} onValueChange={(value) => { if (value) setMemberId(value); }} disabled={saving}><SelectTrigger aria-label="Member to reward" className="w-full"><SelectValue placeholder="Choose a member" /></SelectTrigger><SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.name || member.email || member.id}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="reward-title">Contribution recognized</Label><Input id="reward-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Published a helpful onboarding guide" maxLength={120} disabled={saving} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={(value) => { if (value) setCategory(value); }} disabled={saving}><SelectTrigger aria-label="Contribution category" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="reward-points">Points</Label><Input id="reward-points" type="number" min="1" max="10000" step="1" value={points} onChange={(event) => setPoints(event.target.value)} disabled={saving} /></div></div>
      <div className="space-y-2"><Label htmlFor="reward-note">Context <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="reward-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a short note about the impact…" className="min-h-20 resize-y" maxLength={1000} disabled={saving} /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="button" onClick={() => void submit()} disabled={saving || members.length === 0} className="bg-amber-400 text-black hover:bg-amber-300">{saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Award className="size-4" aria-hidden="true" />}{saving ? "Saving award…" : "Award points"}</Button></div>
    </div>
  </DialogContent></Dialog>;
}
