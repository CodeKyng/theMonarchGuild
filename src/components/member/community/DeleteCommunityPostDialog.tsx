import { LoaderCircle, Trash2 } from "lucide-react";
import type { CommunityPost } from "@/components/member/community/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DeleteCommunityPostDialog({ post, deleting, onClose, onConfirm }: { post: CommunityPost | null; deleting: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={Boolean(post)} onOpenChange={(open) => { if (!open && !deleting) onClose(); }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Delete your post?</DialogTitle><DialogDescription>This will remove your post from the community feed. This can’t be undone.</DialogDescription></DialogHeader>{post && <p className="line-clamp-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">{post.body}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onClose} disabled={deleting}>Keep post</Button><Button type="button" variant="destructive" onClick={onConfirm} disabled={deleting}>{deleting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}{deleting ? "Deleting…" : "Delete post"}</Button></div></DialogContent></Dialog>;
}
