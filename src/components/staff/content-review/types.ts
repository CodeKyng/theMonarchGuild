import type { CommunityCategory, CommunityPost } from "@/components/member/community/types";

export const contentReviewStatuses = ["Needs review", "Reviewed", "Follow-up needed"] as const;
export type ContentReviewStatus = (typeof contentReviewStatuses)[number];

export type ReviewablePost = CommunityPost & {
  reviewStatus: ContentReviewStatus;
  moderationNotes: string;
  reviewedAt: Date | null;
  reviewedBy: string;
};

export type ContentReviewCategory = CommunityCategory | "all";
