import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { auth } = useAuth();
  const loc = useLocation();
  if (!auth.accessToken) {
    const from = `${loc.pathname}${loc.search || ""}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return children;
}
