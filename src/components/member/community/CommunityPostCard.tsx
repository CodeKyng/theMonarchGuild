import { CalendarClock, MoreHorizontal, Trash2 } from "lucide-react";
import type { CommunityPost } from "@/components/member/community/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function dateLabel(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date) : "Just now"; }
export default function CommunityPostCard({ post, canDelete, deleting, onDelete }: { post: CommunityPost; canDelete: boolean; deleting: boolean; onDelete: (post: CommunityPost) => void }) {
  const initials = post.authorName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "M";
  return <Card className="border-border/70 shadow-sm"><CardContent className="p-4 sm:p-5"><div className="flex items-start gap-3"><Avatar className="size-10 shrink-0"><AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{post.authorName}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3" aria-hidden="true" />{dateLabel(post.createdAt)}</p></div>{canDelete && <DropdownMenu><DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Post actions" disabled={deleting} />}><MoreHorizontal className="size-4" aria-hidden="true" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem variant="destructive" onClick={() => onDelete(post)}><Trash2 className="size-4" aria-hidden="true" />Delete post</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div><span className="mt-3 inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">{post.category}</span><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{post.body}</p></div></div></CardContent></Card>;
}
