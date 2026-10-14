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

export default function WorkspaceHeader({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const location = useLocation();
  
  const name = user?.displayName?.trim() || user?.email || roleLabels[role];
  const pageTitle = role === "admin" && location.pathname === "/admin/analytics"
    ? "Analytics"
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
