
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import RoleRoute from "./components/RoleRoute";

// import AdminLayout from "./layouts/AdminLayout";
// import StaffLayout from "./layouts/StaffLayout";
import MemberLayout from "./components/layout/MemberLayout";

import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import Dashboard from "./pages/public/Dashboard";
// import AccessDenied from "./pages/AccessDenied";

// import AdminDashboard from "./pages/admin/AdminDashboard";
// import StaffDashboard from "./pages/staff/StaffDashboard";
import MemberDashboard from "./pages/member/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLayout from "./components/layout/AdminLayout";

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
      {/* <Route element={<RoleRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route
            path="tasks"
            element={<h2>My Tasks</h2>}
          />
          <Route
            path="profile"
            element={<h2>Staff Profile</h2>}
          />
        </Route>
      </Route> */}

      {/* Member routes */}
      <Route element={<RoleRoute allowedRoles={["member"]} />}>
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<MemberDashboard />} />
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
