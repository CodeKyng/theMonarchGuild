export const learningStatuses = ["Draft", "Published", "Archived"] as const;
export const learningFormats = ["Course", "Workshop", "Learning path", "Tutorial", "Resource"] as const;
export const learningLevels = ["Beginner", "Intermediate", "Advanced", "All levels"] as const;

export type LearningStatus = (typeof learningStatuses)[number];

export interface LearningResource {
  id: string;
  title: string;
  summary: string;
  instructor: string;
  category: string;
  format: string;
  level: string;
  duration: string;
  skills: string;
  resourceUrl: string;
  status: LearningStatus;
  createdAt: Date | null;
}
