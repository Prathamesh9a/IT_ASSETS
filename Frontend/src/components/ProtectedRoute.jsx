

// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// For protected pages
export const ProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("access");
  const storedRole = localStorage.getItem("role");

  if (!token || !isAuthenticated) {
   
    return <Navigate to="/" replace  />;
  }

  if (role && role !== (user?.role || storedRole)) {
  
    return <Navigate to="/" replace />;
  }

  return children;
};

// For login/register pages
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("access");
  const storedRole = localStorage.getItem("role");

  if (isAuthenticated || token) {
    // Role-based redirect
    if (user?.role || storedRole) {
      switch (user?.role || storedRole) {
        case "admin":
          return <Navigate to="/adminDashboard" replace />;
        case "super_admin":
          return <Navigate to="/superAdminDashboard" replace />;
        case "user":
        default:
          return <Navigate to="/userDashboard" replace />;
      }
    }
  }

  return children;
};
