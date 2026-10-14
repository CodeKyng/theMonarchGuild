export const opportunityStatuses = ["Open", "Reviewing", "Filled", "Closed"] as const;
export const opportunityTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Grant", "Bounty"] as const;

export type OpportunityStatus = (typeof opportunityStatuses)[number];

export interface AdminOpportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  location: string;
  arrangement: string;
  compensation: string;
  description: string;
  skills: string;
  applicationUrl: string;
  deadline: Date | null;
  status: OpportunityStatus;
  createdAt: Date | null;
}
