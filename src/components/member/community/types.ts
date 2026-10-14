export const communityCategories = ["General", "Wins", "Learning", "Opportunities", "Questions", "Projects"] as const;
export type CommunityCategory = (typeof communityCategories)[number];
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  category: CommunityCategory;
  createdAt: Date | null;
}
