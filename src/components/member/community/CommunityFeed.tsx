import { LoaderCircle, MessageSquareText } from "lucide-react";
import type { CommunityPost } from "@/components/member/community/types";
import CommunityPostCard from "@/components/member/community/CommunityPostCard";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunityFeed({
  posts,
  loading,
  currentUserId,
  deletingId,
  onDelete,
  onAuthorClick,
}: {
  posts: CommunityPost[];
  loading: boolean;
  currentUserId: string;
  deletingId: string;
  onDelete: (post: CommunityPost) => void;
  onAuthorClick?: (post: CommunityPost) => void;
}) {
  return (
    <div className="space-y-3" aria-live="polite">
      {loading && posts.length === 0 ? (
        <div className="space-y-3" role="status" aria-label="Loading community posts">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : posts.length ? (
        posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            canDelete={post.authorId === currentUserId}
            deleting={deletingId === post.id}
            onDelete={onDelete}
            onAuthorClick={onAuthorClick}
          />
        ))
      ) : (
        <Card className="border-dashed shadow-none">
          <CardContent className="px-5 py-12 text-center">
            <MessageSquareText className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">The conversation starts here</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Share a question, celebrate a win, or tell the guild what you’re building.
            </p>
          </CardContent>
        </Card>
      )}
      {loading && posts.length > 0 && (
        <p className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Refreshing conversations…
        </p>
      )}
    </div>
  );
}
