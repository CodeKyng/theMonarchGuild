export interface AuditLogEntry {
  id: string;
  action: string;
  category: string;
  actorName: string;
  actorEmail: string;
  actorId: string;
  target: string;
  targetId: string;
  description: string;
  severity: string;
  createdAt: Date | null;
  metadata: Record<string, unknown>;
}
