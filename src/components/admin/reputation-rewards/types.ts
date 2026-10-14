export interface ReputationMember {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  contributions: number;
}

export interface RewardActivity {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  category: string;
  points: number;
  note: string;
  createdAt: Date | null;
}

export interface RewardDraft {
  member: ReputationMember;
  title: string;
  category: string;
  points: number;
  note: string;
}
