import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { auth } = useAuth();
  if (!auth.accessToken) return <Navigate to="/login" replace />;
  if (auth.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
