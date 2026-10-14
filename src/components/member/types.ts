import type { LucideIcon } from "lucide-react";
export interface MemberResource { id: string; title: string; description: string; category: string; owner: string; status: string; date: Date | null; link: string; meta: string; }
export interface MemberSectionConfig { title: string; collection?: string; description: string; emptyTitle: string; emptyDescription: string; icon: LucideIcon; kind: "directory" | "private" | "inbox"; }
