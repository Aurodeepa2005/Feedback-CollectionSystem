import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PublicRoute
 * -----------
 * Used to wrap public-only pages such as /login and /register.
 *
 * Behaviour:
 *   1. While auth state is loading → render nothing (prevents flash redirect).
 *   2. If the user is already authenticated → redirect to /dashboard.
 *   3. Otherwise → render the page / Outlet.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // ── 1. Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return null; // avoid a premature redirect while session is being restored
  }

  // ── 2. Already authenticated ─────────────────────────────────────────────
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── 3. Not authenticated — render public page ─────────────────────────────
  return children ? children : <Outlet />;
};

export default PublicRoute;
