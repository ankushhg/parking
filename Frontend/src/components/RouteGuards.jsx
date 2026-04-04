import { Navigate, useLocation } from "react-router-dom";

export function GuestRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Allow access to /admin/login even if token exists (handles re-login after expiry)
  if (token && location.pathname !== "/admin/login") {
    return <Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  }
  return children;
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  if (adminOnly && role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}
