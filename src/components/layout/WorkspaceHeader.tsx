import { useAuth, type UserRole } from "@/auth/AuthContext";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { AvatarDropdown } from "./AvatarDropdown";
import { ModeToggle } from "../mode-toggle";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  staff: "Guild staff",
  member: "Guild member",
};

const adminPageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/analytics": "Analytics",
  "/admin/members": "Members",
  "/admin/staff-management": "Staff Management",
  "/admin/roles-permissions": "Roles & Permissions",
  "/admin/community-content": "Community & Content",
  "/admin/projects": "Projects",
  "/admin/opportunities": "Opportunities",
  "/admin/events": "Events",
  "/admin/learning-management": "Learning Management",
  "/admin/reports-moderation": "Reports & Moderation",
  "/admin/support": "Support",
  "/admin/reputation-rewards": "Reputation & Rewards",
  "/admin/audit-logs": "Audit Logs",
  "/admin/security-center": "Security Center",
  "/admin/integrations": "Integrations",
  "/admin/platform-settings": "Platform Settings",
};

export default function WorkspaceHeader({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const location = useLocation();
  
  const name = user?.displayName?.trim() || user?.email || roleLabels[role];
  const pageTitle = role === "admin"
    ? adminPageTitles[location.pathname] ?? "Admin workspace"
    : roleLabels[role];
  

  return (
    <header className="sticky rounded rounded-b-md top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger aria-label="Toggle navigation" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{pageTitle}</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">Welcome back, {name}</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <ModeToggle />
        <AvatarDropdown />
      </div>
    </header>
  );
}
