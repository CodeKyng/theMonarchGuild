import { Link, useLocation } from "react-router-dom";
import {
  Activity, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined,
  Bell, ClipboardList, Compass, Flag, FolderKanban, Gift, GraduationCap, Home,
  LayoutDashboard, LifeBuoy, Mail, Plug, Settings2, ShieldCheck, ShieldEllipsis,
  Trophy, UserRound, UsersRound, type LucideIcon,
} from "lucide-react";

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
  useSidebar,
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
  const { isMobile, setOpenMobile } = useSidebar();
  const dashboardPath = rolePaths[role];
  const adminGroups: { label: string; links: { label: string; href: string; icon: LucideIcon }[] }[] = [
    { label: "Workspace", links: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Members", href: "/admin/members", icon: UsersRound },
      { label: "Staff Management", href: "/admin/staff-management", icon: BriefcaseBusiness },
      { label: "Roles & Permissions", href: "/admin/roles-permissions", icon: ShieldCheck },
    ] },
    { label: "Community & Content", links: [
      { label: "Community & Content", href: "/admin/community-content", icon: Activity },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Opportunities", href: "/admin/opportunities", icon: BriefcaseBusiness },
      { label: "Events", href: "/admin/events", icon: CalendarDays },
      { label: "Learning Management", href: "/admin/learning-management", icon: GraduationCap },
    ] },
    { label: "Operations", links: [
      { label: "Reports & Moderation", href: "/admin/reports-moderation", icon: Flag },
      { label: "Support", href: "/admin/support", icon: LifeBuoy },
      { label: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
      { label: "Reputation & Rewards", href: "/admin/reputation-rewards", icon: Gift },
    ] },
    { label: "Governance", links: [
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
      { label: "Security Center", href: "/admin/security-center", icon: ShieldEllipsis },
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "Platform Settings", href: "/admin/platform-settings", icon: Settings2 },
    ] },
  ];
  const basicLinks = [
    { label: "Overview", href: dashboardPath, icon: LayoutDashboard },
    { label: "Guild home", href: "/", icon: Home },
  ];
  const memberGroups: { label: string; links: { label: string; href: string; icon: LucideIcon }[] }[] = [
    { label: "Guild", links: [
      { label: "Overview", href: "/member", icon: LayoutDashboard },
      { label: "Community", href: "/member/community", icon: Activity },
      { label: "Explore Members", href: "/member/explore-members", icon: Compass },
    ] },
    { label: "Grow", links: [
      { label: "Projects", href: "/member/projects", icon: FolderKanban },
      { label: "Opportunities", href: "/member/opportunities", icon: BriefcaseBusiness },
      { label: "Learning Hub", href: "/member/learning-hub", icon: GraduationCap },
      { label: "Events", href: "/member/events", icon: CalendarDays },
      { label: "Leaderboard", href: "/member/leaderboard", icon: Trophy },
    ] },
    { label: "You", links: [
      { label: "Messages", href: "/member/messages", icon: Mail },
      { label: "Notifications", href: "/member/notifications", icon: Bell },
      { label: "My Profile", href: "/member/profile", icon: UserRound },
      { label: "Settings", href: "/member/settings", icon: Settings2 },
    ] },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to={dashboardPath} />}>
              <div className="flex size-9 items-center justify-center rounded-xl text-black">
                <img src="theMonarchGuildLogo.png" className="size-9" aria-hidden="true" />
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
        {(role === "admin" ? adminGroups : role === "member" ? memberGroups : [{ label: "Workspace", links: basicLinks }]).map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.links.map(({ label, href, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={location.pathname === href || (href !== "/admin" && href !== "/member" && location.pathname.startsWith(`${href}/`))}
                  tooltip={label}
                  render={<Link to={href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-sidebar-foreground/50">Connect. Contribute. Grow.</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
