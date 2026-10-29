export interface PublicMemberProfile {
  id: string;
  displayName: string;
  professionalTitle: string;
  workType: string;
  experienceYears: string;
  skills: string[];
  location: string;
  bio: string;
  interests: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  followerCount?: number;
  followingCount?: number;
}
