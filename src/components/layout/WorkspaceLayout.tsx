import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import type { UserRole } from "@/auth/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import WorkspaceHeader from "./WorkspaceHeader";

export default function WorkspaceLayout({
  role,
  children,
}: {
  role: UserRole;
  children?: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <WorkspaceHeader role={role} />
        <main className="min-h-[calc(100svh-4rem)] min-w-0 flex-1 bg-muted/30 p-3 sm:p-5 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children ?? <Outlet />}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
