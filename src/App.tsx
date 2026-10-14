
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

// import AdminLayout from "./layouts/AdminLayout";
// import StaffLayout from "./layouts/StaffLayout";
import MemberLayout from "./components/layout/MemberLayout";

const Login = lazy(() => import("./pages/public/Login"));
const Signup = lazy(() => import("./pages/public/Signup"));
const Dashboard = lazy(() => import("./pages/public/Dashboard"));
// import AccessDenied from "./pages/AccessDenied";

// import AdminDashboard from "./pages/admin/AdminDashboard";
// import StaffDashboard from "./pages/staff/StaffDashboard";
const MemberDashboard = lazy(() => import("./pages/member/Dashboard"));
const StaffDashboard = lazy(() => import("./pages/staff/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
import AdminLayout from "./components/layout/AdminLayout";
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
      {/* <Route path="/access-denied" element={<AccessDenied />} /> */}

      {/* Admin routes */}
      <Route element={<RoleRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="account" element={<Account />} />
          {/* <Route
            path="users"
            element={<h2>Manage Users</h2>}
          />
          <Route
            path="staff"
            element={<h2>Manage Staff</h2>}
          />
          <Route
            path="settings"
            element={<h2>Admin Settings</h2>}
          /> */}
        </Route>
      </Route>

      {/* Staff routes */}
      <Route element={<RoleRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>

      {/* Member routes */}
      <Route element={<RoleRoute allowedRoles={["member"]} />}>
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<MemberDashboard />} />
          <Route path="account" element={<Account />} />
          {/* <Route
            path="services"
            element={<h2>Member Services</h2>}
          />
          <Route
            path="profile"
            element={<h2>My Profile</h2>}
          /> */}
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
