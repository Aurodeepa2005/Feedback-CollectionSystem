import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * DashboardRedirect
 * -----------------
 * Acts as a smart router for the /dashboard path.
 * Redirects users to their role-specific dashboard automatically.
 *
 * Supported roles:
 *   admin   → /admin/dashboard
 *   student → /student/dashboard
 *   default → /student/dashboard (fallback)
 */
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "faculty":
      return <Navigate to="/faculty/dashboard" replace />;
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

export default DashboardRedirect;
