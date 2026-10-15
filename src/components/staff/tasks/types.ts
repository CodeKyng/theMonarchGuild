export const staffTaskStatuses = ["Assigned", "In progress", "Completed"] as const;
export const staffTaskPriorities = ["Urgent", "High", "Normal", "Low"] as const;

export type StaffTaskStatus = (typeof staffTaskStatuses)[number];
export type StaffTaskPriority = (typeof staffTaskPriorities)[number];

export type StaffTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: StaffTaskPriority;
  status: StaffTaskStatus;
  dueAt: Date | null;
  staffNote: string;
  assignedByName: string;
};
