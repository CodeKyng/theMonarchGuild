
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import RoleRoute from "./components/RoleRoute";
import StaffLayout from "./components/layout/StaffLayout";
import MemberLayout from "./components/layout/MemberLayout";
import AdminLayout from "./components/layout/AdminLayout";

const Login = lazy(() => import("./pages/public/Login"));
const Signup = lazy(() => import("./pages/public/Signup"));
const Dashboard = lazy(() => import("./pages/public/Dashboard"));

const MemberDashboard = lazy(() => import("./pages/member/Dashboard"));
const MemberTasks = lazy(() => import("./pages/member/Tasks"));
const MemberSettings = lazy(() => import("./pages/member/Settings"));
const MemberCommunity = lazy(() => import("./pages/member/Community"));
const ExploreMembers = lazy(() => import("./pages/member/ExploreMembers"));
const MemberProjects = lazy(() => import("./pages/member/Projects"));
const MemberOpportunities = lazy(() => import("./pages/member/Opportunities"));
const MemberLearningHub = lazy(() => import("./pages/member/LearningHub"));
const MemberEvents = lazy(() => import("./pages/member/Events"));
const MemberLeaderboard = lazy(() => import("./pages/member/Leaderboard"));
const MemberMessages = lazy(() => import("./pages/member/Messages"));
const MemberNotifications = lazy(() => import("./pages/member/Notifications"));
const MemberProfile = lazy(() => import("./pages/member/Profile"));

const StaffDashboard = lazy(() => import("./pages/staff/Dashboard"));
const StaffModulePage = lazy(() => import("./pages/staff/StaffModulePage"));
const StaffTasks = lazy(() => import("./pages/staff/Tasks"));
const StaffAssignedTasks = lazy(() => import("./pages/staff/AssignedTasks"));
const StaffMembers = lazy(() => import("./pages/staff/Members"));
const StaffModerationQueue = lazy(() => import("./pages/staff/ModerationQueue"));
const StaffReports = lazy(() => import("./pages/staff/Reports"));
const StaffContentReview = lazy(() => import("./pages/staff/ContentReview"));
const StaffAnnouncements = lazy(() => import("./pages/staff/Announcements"));
const StaffOpportunities = lazy(() => import("./pages/staff/Opportunities"));
const StaffEvents = lazy(() => import("./pages/staff/Events"));
const StaffSupportInbox = lazy(() => import("./pages/staff/SupportInbox"));
const StaffAnalytics = lazy(() => import("./pages/staff/Analytics"));
const StaffSettings = lazy(() => import("./pages/staff/Settings"));
const StaffTaskVerification = lazy(() => import("./pages/staff/TaskVerification"));

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminStaffManagement = lazy(() => import("./pages/admin/StaffManagement"));
const AdminRolesPermissions = lazy(() => import("./pages/admin/RolesPermissions"));
const AdminCommunityContent = lazy(() => import("./pages/admin/CommunityContent"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const AdminOpportunities = lazy(() => import("./pages/admin/Opportunities"));
const AdminLearningManagement = lazy(() => import("./pages/admin/LearningManagement"));
const AdminReportsModeration = lazy(() => import("./pages/admin/ReportsModeration"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const AdminReputationRewards = lazy(() => import("./pages/admin/ReputationRewards"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminSecurityCenter = lazy(() => import("./pages/admin/SecurityCenter"));
const AdminIntegrations = lazy(() => import("./pages/admin/Integrations"));
const AdminPlatformSettings = lazy(() => import("./pages/admin/PlatformSettings"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const AdminTasks = lazy(() => import("./pages/admin/Tasks"));
const AdminModulePage = lazy(() => import("./pages/admin/AdminModulePage"));
const Account = lazy(() => import("./pages/Account"));

function HomeRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading application...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (!role) return <Navigate to="/access-denied" replace />;

  return <Navigate to={`/${role}`} replace />;
}

function NotFound() {
  return (
    <main>
      <h1>404 - Page Not Found</h1>
      <a href="/">Return home</a>
    </main>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<main role="status" className="grid min-h-svh place-items-center p-6 text-sm text-muted-foreground">Loading page…</main>}>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup /> } />
      <Route path="/" element={<Dashboard />} />

      {/* Admin routes */}
      <Route element={<RoleRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="members" element={<AdminUsers />} />
          <Route path="staff-management" element={<AdminStaffManagement />} />
          <Route path="roles-permissions" element={<AdminRolesPermissions />} />
          <Route path="community-content" element={<AdminCommunityContent />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="opportunities" element={<AdminOpportunities />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="learning-management" element={<AdminLearningManagement />} />
          <Route path="reports-moderation" element={<AdminReportsModeration />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="reputation-rewards" element={<AdminReputationRewards />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="security-center" element={<AdminSecurityCenter />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="platform-settings" element={<AdminPlatformSettings />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="users" element={<Navigate to="/admin/members" replace />} />
          <Route path="account" element={<Account />} />
          <Route path="messages" element={<MemberMessages />} />
          <Route path="notifications" element={<MemberNotifications />} />
          <Route path=":section" element={<AdminModulePage />} />
        </Route>
      </Route>

      {/* Staff routes */}
      <Route element={<RoleRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="account" element={<Account />} />
          <Route path="tasks" element={<StaffTasks />} />
          <Route path="assigned-tasks" element={<StaffAssignedTasks />} />
          <Route path="task-verification" element={<StaffTaskVerification />} />
          <Route path="members" element={<StaffMembers />} />
          <Route path="moderation-queue" element={<StaffModerationQueue />} />
          <Route path="reports" element={<StaffReports />} />
          <Route path="content-review" element={<StaffContentReview />} />
          <Route path="announcements" element={<StaffAnnouncements />} />
          <Route path="opportunities" element={<StaffOpportunities />} />
          <Route path="events" element={<StaffEvents />} />
          <Route path="support-inbox" element={<StaffSupportInbox />} />
          <Route path="analytics" element={<StaffAnalytics />} />
          <Route path="settings" element={<StaffSettings />} />
          <Route path="messages" element={<MemberMessages />} />
          <Route path="notifications" element={<MemberNotifications />} />
          <Route path=":section" element={<StaffModulePage />} />
        </Route>
      </Route>

      {/* Member routes */}
      <Route element={<RoleRoute allowedRoles={["member"]} />}>
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<MemberDashboard />} />
          <Route path="overview" element={<Navigate to="/member" replace />} />
          <Route path="community" element={<MemberCommunity />} />
          <Route path="explore-members" element={<ExploreMembers />} />
          <Route path="projects" element={<MemberProjects />} />
          <Route path="opportunities" element={<MemberOpportunities />} />
          <Route path="tasks" element={<MemberTasks />} />
          <Route path="learning-hub" element={<MemberLearningHub />} />
          <Route path="events" element={<MemberEvents />} />
          <Route path="messages" element={<MemberMessages />} />
          <Route path="notifications" element={<MemberNotifications />} />
          <Route path="leaderboard" element={<MemberLeaderboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="settings" element={<MemberSettings />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>

      {/* Home and fallback */}
      <Route path="/" element={<HomeRedirect />} /> 
      <Route path="*" element={<NotFound />} /> 
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
