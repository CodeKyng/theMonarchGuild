import { Link, useLocation } from "react-router-dom";
import { BarChart3, Crown, Home, LayoutDashboard, UsersRound, type LucideIcon } from "lucide-react";

import type { UserRole } from "@/auth/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole;
}

const roleNames: Record<UserRole, string> = {
  admin: "Admin workspace",
  staff: "Staff workspace",
  member: "Member workspace",
};

const rolePaths: Record<UserRole, string> = {
  admin: "/admin",
  staff: "/staff",
  member: "/member",
};

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  const location = useLocation();
  const dashboardPath = rolePaths[role];
  const links: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Overview", href: dashboardPath, icon: LayoutDashboard },
    ...(role === "admin" ? [{ label: "Analytics", href: "/admin/analytics", icon: BarChart3 }] : []),
    ...(role === "admin" ? [{ label: "Users", href: "/admin/users", icon: UsersRound }] : []),
    { label: "Guild home", href: "/", icon: Home },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to={dashboardPath} />}>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400 text-black">
                <Crown className="size-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                <span className="truncate font-semibold">The Monarch Guild</span>
                <span className="truncate text-xs text-sidebar-foreground/60">{roleNames[role]}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {links.map(({ label, href, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={location.pathname === href}
                  tooltip={label}
                  render={<Link to={href} />}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-sidebar-foreground/50">Connect. Contribute. Grow.</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
