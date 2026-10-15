import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { CalendarClock, LoaderCircle, UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { contentReviewStatuses, type ContentReviewStatus, type ReviewablePost } from "./types";

function formatDate(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date) : "Recently posted"; }

export default function ContentReviewDialog({ post, onClose, onSaved }: { post: ReviewablePost | null; onClose: () => void; onSaved: (id: string, reviewStatus: ContentReviewStatus, notes: string) => void }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<ContentReviewStatus>(post?.reviewStatus ?? "Needs review");
  const [notes, setNotes] = useState(post?.moderationNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveReview() {
    if (!post || !user) return;
    setSaving(true); setError("");
    try {
      await setDoc(doc(db, "contentReviews", post.id), { postId: post.id, reviewStatus: status, moderationNotes: notes.trim(), reviewedBy: user.uid, reviewedAt: serverTimestamp() }, { merge: true });
      onSaved(post.id, status, notes.trim()); onClose();
    } catch (saveError) {
      console.error("Failed to save content review:", saveError);
      setError("The review could not be saved. Check your connection and staff permissions, then try again.");
    } finally { setSaving(false); }
  }

  return <Dialog open={Boolean(post)} onOpenChange={(open) => { if (!open && !saving) onClose(); }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Review community post</DialogTitle><DialogDescription>Record the review outcome and leave a note for the staff team.</DialogDescription></DialogHeader>{post && <div className="space-y-5">
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">{post.category}</span><span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span></div>
    <section className="rounded-xl border border-border p-4"><div className="mb-3 flex items-center gap-2 text-sm"><UserRound className="size-4 text-muted-foreground" aria-hidden="true" /><span className="font-semibold">{post.authorName}</span></div><p className="whitespace-pre-wrap break-words text-sm leading-6">{post.body}</p></section>
    {post.reviewedAt && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="size-3.5" aria-hidden="true" />Last reviewed {formatDate(post.reviewedAt)}</p>}
    <div className="space-y-2"><Label htmlFor="content-review-status">Review outcome</Label><Select value={status} onValueChange={(value) => { if (value) setStatus(value as ContentReviewStatus); }} disabled={saving}><SelectTrigger id="content-review-status" className="w-full bg-background"><SelectValue /></SelectTrigger><SelectContent>{contentReviewStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-2"><Label htmlFor="content-review-notes">Staff notes</Label><Textarea id="content-review-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context or a follow-up action for the team…" rows={4} maxLength={1500} disabled={saving} /><p className="text-right text-xs text-muted-foreground">{notes.length}/1500</p></div>
    {error && <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    <div className="flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="button" onClick={() => void saveReview()} disabled={saving || !user}>{saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}{saving ? "Saving review…" : "Save review"}</Button></div>
  </div>}</DialogContent></Dialog>;
}
