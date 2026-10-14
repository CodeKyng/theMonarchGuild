import type { LucideIcon } from "lucide-react";

export type IntegrationCategory = "Core platform" | "Authentication";
export interface GuildIntegration {
  id: string;
  name: string;
  category: IntegrationCategory;
  summary: string;
  description: string;
  state: string;
  icon: LucideIcon;
  usedFor: string[];
  setup: string[];
  security: string;
  codeReference: string;
}
