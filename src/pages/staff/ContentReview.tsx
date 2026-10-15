import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { FileCheck2, Info, RefreshCw } from "lucide-react";
import ContentReviewDialog from "@/components/staff/content-review/ContentReviewDialog";
import ContentReviewDirectory from "@/components/staff/content-review/ContentReviewDirectory";
import ContentReviewSummary from "@/components/staff/content-review/ContentReviewSummary";
import { communityCategories } from "@/components/member/community/types";
import { contentReviewStatuses, type ContentReviewStatus, type ReviewablePost } from "@/components/staff/content-review/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function postFromDocument(id: string, postData: Record<string, unknown>, reviewData?: Record<string, unknown>): ReviewablePost {
  const rawCategory = stringValue(postData.category);
  const rawStatus = stringValue(reviewData?.reviewStatus);
  return {
    id,
    authorId: stringValue(postData.authorId),
    authorName: stringValue(postData.authorName) || "Guild member",
    body: stringValue(postData.body),
    category: communityCategories.find((category) => category === rawCategory) ?? "General",
    createdAt: readDate(postData.createdAt),
    reviewStatus: contentReviewStatuses.find((status) => status.toLowerCase() === rawStatus.toLowerCase()) ?? "Needs review",
    moderationNotes: stringValue(reviewData?.moderationNotes),
    reviewedAt: readDate(reviewData?.reviewedAt),
    reviewedBy: stringValue(reviewData?.reviewedBy),
  };
}

export default function StaffContentReview() {
  const [posts, setPosts] = useState<ReviewablePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ReviewablePost | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [postsSnapshot, reviewsSnapshot] = await Promise.all([
        getDocs(collection(db, "communityPosts")),
        getDocs(collection(db, "contentReviews")),
      ]);
      const reviews = new Map(reviewsSnapshot.docs.map((entry) => [entry.id, entry.data()]));
      const rows = postsSnapshot.docs.map((entry) => postFromDocument(entry.id, entry.data(), reviews.get(entry.id)))
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setPosts(rows);
      setSelectedPost((current) => current ? rows.find((post) => post.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load content review queue:", loadError);
      setError("Community content could not be loaded. Check your connection and staff permissions, then try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);

  const filteredPosts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesText = !needle || `${post.authorName} ${post.body} ${post.category}`.toLowerCase().includes(needle);
      return matchesText && (status === "all" || post.reviewStatus === status) && (category === "all" || post.category === category);
    });
  }, [posts, search, status, category]);

  function handleSaved(id: string, reviewStatus: ContentReviewStatus, moderationNotes: string) {
    const reviewedAt = new Date();
    setPosts((current) => current.map((post) => post.id === id ? { ...post, reviewStatus, moderationNotes, reviewedAt } : post));
    setSelectedPost((current) => current?.id === id ? { ...current, reviewStatus, moderationNotes, reviewedAt } : current);
  }
  function clearFilters() { setSearch(""); setStatus("all"); setCategory("all"); }

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><FileCheck2 className="size-4" aria-hidden="true" />Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Content review</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Review recent community posts, record outcomes, and leave clear follow-up notes for the team.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh content</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}
    <ContentReviewSummary posts={posts} loading={loading} />
    <ContentReviewDirectory posts={filteredPosts} allPosts={posts} loading={loading} search={search} status={status} category={category} onSearch={setSearch} onStatus={setStatus} onCategory={setCategory} onClear={clearFilters} onOpen={setSelectedPost} />
    <aside className="flex gap-3 rounded-2xl border border-border bg-muted/30 p-4"><Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">Review outcomes and staff notes are stored separately from member posts. Recording a review does not change or hide the post in the community feed.</p></aside>
    <ContentReviewDialog key={selectedPost?.id ?? "closed"} post={selectedPost} onClose={() => setSelectedPost(null)} onSaved={handleSaved} />
  </div>;
}
