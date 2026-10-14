export type SecurityRole = "admin" | "staff" | "member" | "unassigned";
export interface SecurityAccount {
  id: string;
  name: string;
  email: string;
  role: SecurityRole;
  createdAt: Date | null;
  flagged: boolean;
  flagReason: string;
}
export interface SecurityEvent {
  id: string;
  action: string;
  category: string;
  actor: string;
  target: string;
  severity: string;
  createdAt: Date | null;
}
