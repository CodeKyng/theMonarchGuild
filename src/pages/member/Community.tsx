import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import CommunityComposer from "@/components/member/community/CommunityComposer";
import CommunityFeed from "@/components/member/community/CommunityFeed";
import CommunityFeedFilters from "@/components/member/community/CommunityFeedFilters";
import CommunityGuidelines from "@/components/member/community/CommunityGuidelines";
import CommunityHeader from "@/components/member/community/CommunityHeader";
import DeleteCommunityPostDialog from "@/components/member/community/DeleteCommunityPostDialog";
import type { CommunityCategory, CommunityPost } from "@/components/member/community/types";
import { communityCategories } from "@/components/member/community/types";
import MemberProfileDialog from "@/components/member/explore-members/MemberProfileDialog";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/firebase";

function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }
  return typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function minimalProfile(post: CommunityPost): PublicMemberProfile {
  return {
    id: post.authorId,
    displayName: post.authorName || "Guild member",
    professionalTitle: "",
    workType: "",
    experienceYears: "",
    skills: [],
    location: "",
    bio: "",
    interests: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
  };
}

export default function MemberCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
  const [selectedMember, setSelectedMember] = useState<PublicMemberProfile | null>(null);

  useEffect(() => {
    const feedQuery = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
    return onSnapshot(
      feedQuery,
      (snapshot) => {
        setPosts(
          snapshot.docs.map((entry) => {
            const data = entry.data();
            const rawCategory = typeof data.category === "string" ? data.category : "General";
            const safeCategory = communityCategories.find((item) => item === rawCategory) ?? "General";
            return {
              id: entry.id,
              authorId: typeof data.authorId === "string" ? data.authorId : "",
              authorName: typeof data.authorName === "string" ? data.authorName : "Guild member",
              body: typeof data.body === "string" ? data.body : "",
              category: safeCategory,
              createdAt: readDate(data.createdAt),
            } satisfies CommunityPost;
          }),
        );
        setError("");
        setLoading(false);
      },
      (loadError) => {
        console.error("Failed to load community feed:", loadError);
        setError("The community feed could not be loaded. Check your connection and access, then try again.");
        setLoading(false);
      },
    );
  }, []);

  const filteredPosts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (!needle || `${post.authorName} ${post.body} ${post.category}`.toLowerCase().includes(needle)) &&
        (category === "all" || post.category === category),
    );
  }, [posts, search, category]);

  async function publish(body: string, postCategory: CommunityCategory) {
    if (!user) throw new Error("Sign in to publish a post.");
    setPosting(true);
    setActionError("");
    try {
      await addDoc(collection(db, "communityPosts"), {
        authorId: user.uid,
        authorName: user.displayName?.trim() || user.email?.split("@")[0] || "Guild member",
        body,
        category: postCategory,
        createdAt: serverTimestamp(),
      });
    } catch (publishError) {
      console.error("Failed to publish community post:", publishError);
      setActionError("Your post could not be published. Check your connection and try again.");
      throw publishError;
    } finally {
      setPosting(false);
    }
  }

  async function deletePost() {
    if (!postToDelete || !user || postToDelete.authorId !== user.uid) return;
    const post = postToDelete;
    setDeletingId(post.id);
    setActionError("");
    try {
      await deleteDoc(doc(db, "communityPosts", post.id));
      setPostToDelete(null);
    } catch (deleteError) {
      console.error("Failed to delete community post:", deleteError);
      setActionError("Your post could not be deleted. Check your connection and try again.");
    } finally {
      setDeletingId("");
    }
  }

  async function openAuthorProfile(post: CommunityPost) {
    if (!post.authorId) {
      setSelectedMember(minimalProfile(post));
      return;
    }
    try {
      const snap = await getDoc(doc(db, "publicProfiles", post.authorId));
      if (snap.exists()) {
        const data = snap.data();
        setSelectedMember({
          id: post.authorId,
          displayName: asText(data.displayName) || post.authorName || "Guild member",
          professionalTitle: asText(data.professionalTitle),
          workType: asText(data.workType),
          experienceYears: asText(data.experienceYears),
          skills: asSkills(data.skills),
          location: asText(data.location),
          bio: asText(data.bio),
          interests: asText(data.interests),
          websiteUrl: asText(data.websiteUrl),
          linkedinUrl: asText(data.linkedinUrl),
          githubUrl: asText(data.githubUrl),
          twitterUrl: asText(data.twitterUrl),
        });
      } else {
        setSelectedMember(minimalProfile(post));
      }
    } catch (err) {
      console.error("Failed to load author profile:", err);
      setSelectedMember(minimalProfile(post));
    }
  }

  return (
    <div className="space-y-6">
      <CommunityHeader />
      <CommunityComposer
        name={user?.displayName || "Guild member"}
        photoUrl={user?.photoURL || ""}
        posting={posting}
        onPost={publish}
      />
      {actionError && (
        <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {actionError}
        </p>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 space-y-4">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-4">
              <CommunityFeedFilters
                search={search}
                category={category}
                onSearch={setSearch}
                onCategory={setCategory}
              />
            </CardContent>
          </Card>
          {error && (
            <div role="alert" className="flex gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm leading-5 text-destructive">{error}</p>
            </div>
          )}
          <CommunityFeed
            posts={filteredPosts}
            loading={loading}
            currentUserId={user?.uid ?? ""}
            deletingId={deletingId}
            onDelete={setPostToDelete}
            onAuthorClick={(post) => void openAuthorProfile(post)}
          />
        </section>
        <aside className="xl:sticky xl:top-20">
          <CommunityGuidelines />
        </aside>
      </div>
      <DeleteCommunityPostDialog
        post={postToDelete}
        deleting={Boolean(postToDelete && deletingId === postToDelete.id)}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => void deletePost()}
      />
      <MemberProfileDialog member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
