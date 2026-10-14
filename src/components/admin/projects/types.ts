export const projectStatuses = ["Planning", "Recruiting", "In progress", "Completed", "On hold"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  skills: string;
  status: ProjectStatus;
  projectUrl: string;
  createdAt: Date | null;
}
