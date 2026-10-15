import { FileCheck2, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ContentReviewCard from "./ContentReviewCard";
import ContentReviewFilters from "./ContentReviewFilters";
import type { ReviewablePost } from "./types";

export default function ContentReviewDirectory({ posts, allPosts, loading, search, status, category, onSearch, onStatus, onCategory, onClear, onOpen }: { posts: ReviewablePost[]; allPosts: ReviewablePost[]; loading: boolean; search: string; status: string; category: string; onSearch: (value: string) => void; onStatus: (value: string) => void; onCategory: (value: string) => void; onClear: () => void; onOpen: (post: ReviewablePost) => void }) {
  const filtered = Boolean(search.trim() || status !== "all" || category !== "all");
  return <Card className="border-border/70 shadow-sm"><CardContent className="space-y-5 p-4 sm:p-6"><ContentReviewFilters search={search} status={status} category={category} onSearch={onSearch} onStatus={onStatus} onCategory={onCategory} onClear={onClear} />
    {loading && allPosts.length === 0 ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading community content">{[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted" />)}</div> : posts.length ? <><p className="text-xs text-muted-foreground">Showing {posts.length} of {allPosts.length} posts</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <ContentReviewCard key={post.id} post={post} onOpen={onOpen} />)}</div></> : <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">{filtered ? <SearchX className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" /> : <FileCheck2 className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />}<h3 className="mt-3 font-semibold">{filtered ? "No content matches those filters" : "No community posts yet"}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{filtered ? "Try another search term, topic, or review status." : "New community posts will appear here for staff review."}</p>{filtered && <button type="button" onClick={onClear} className="mt-4 text-sm font-semibold text-primary hover:underline">Clear filters</button>}</div>}
  </CardContent></Card>;
}
