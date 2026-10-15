export interface StaffActivityPoint {
  label: string;
  posts: number;
  events: number;
}

export interface StaffQueueCounts {
  reports: {
    new: number;
    underReview: number;
    resolved: number;
    dismissed: number;
  } | null;
  content: {
    needsReview: number;
    reviewed: number;
    followUp: number;
  } | null;
}

export interface StaffWorkloadCounts {
  assigned: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface StaffAnalyticsData {
  posts: number | null;
  opportunities: number | null;
  upcomingEvents: number | null;
  activity: StaffActivityPoint[];
  queues: StaffQueueCounts;
  workload: StaffWorkloadCounts | null;
}
