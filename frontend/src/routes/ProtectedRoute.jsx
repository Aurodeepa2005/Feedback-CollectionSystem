import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * -------------
 * Guards routes that require authentication.
 *
 * Props:
 *   allowedRoles  – optional array of roles permitted to access the route.
 *                   e.g. ["admin"] or ["student", "admin"]
 *
 * Behaviour:
 *   1. While auth state is loading → show a full-screen spinner.
 *   2. If not authenticated → redirect to /login (with the intended URL saved).
 *   3. If authenticated but role not allowed → redirect to /unauthorized.
 *   4. If authenticated and role allowed (or no role restriction) → render children / Outlet.
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // ── 1. Wait for session restore ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.02em" }}>
          Verifying session…
        </span>
      </div>
    );
  }

  // ── 2. Not authenticated ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── 3. Role-based access control ─────────────────────────────────────────
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ── 4. Authorized ─────────────────────────────────────────────────────────
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
