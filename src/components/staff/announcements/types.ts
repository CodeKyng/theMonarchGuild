export const announcementStatuses = ["Draft", "Scheduled", "Published", "Archived"] as const;
export const announcementCategories = ["Guild update", "Events", "Opportunities", "Community", "Important"] as const;
export type AnnouncementStatus = (typeof announcementStatuses)[number];
export type AnnouncementCategory = (typeof announcementCategories)[number];

export type GuildAnnouncement = {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  publishAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string;
  createdByName: string;
};
