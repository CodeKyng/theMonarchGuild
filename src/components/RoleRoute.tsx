
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "../auth/AuthContext";

type RoleRouteProps = {
  allowedRoles: UserRole[];
};

export default function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    return <Navigate to="/access-denied" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Outlet />;
}
