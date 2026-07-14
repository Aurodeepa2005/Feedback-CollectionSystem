import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ─── Context ──────────────────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";

// ─── Route Guards ─────────────────────────────────────────────────────────────
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

// ─── Layout ───────────────────────────────────────────────────────────────────
import ShellLayout from "./components/layout/ShellLayout";

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// ─── Shared Pages ─────────────────────────────────────────────────────────────
import DashboardRedirect from "./pages/DashboardRedirect";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

// ─── Student Pages ────────────────────────────────────────────────────────────
import StudentDashboard from "./pages/student/StudentDashboard";
import FeedbackForms from "./pages/student/FeedbackForms";
import MyFeedback from "./pages/student/MyFeedback";
import ProfilePage from "./pages/student/ProfilePage";
import SettingsPage from "./pages/student/SettingsPage";

// ─── Faculty Pages ────────────────────────────────────────────────────────────
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyFeedbackView from "./pages/faculty/FacultyFeedbackView";
import FeedbackAnalytics from "./pages/faculty/FeedbackAnalytics";

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import FacultyManagement from "./pages/admin/FacultyManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import ResponsesPage from "./pages/admin/ResponsesPage";

// ─── Shared profile/settings (reused across roles) ────────────────────────────
// Admin + Faculty share the same profile/settings pages as Student
// (they can be extended later per role if needed)

// ─────────────────────────────────────────────────────────────────────────────

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Root redirect ─────────────────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ── Public Routes ─────────────────────────────────────────────── */}
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* ── Smart Dashboard Redirect ───────────────────────────────────── */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>}
            />

            {/* ── Student Routes ─────────────────────────────────────────────── */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ShellLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student/dashboard"   element={<StudentDashboard />} />
              <Route path="/student/forms"       element={<FeedbackForms />} />
              <Route path="/student/my-feedback" element={<MyFeedback />} />
              <Route path="/student/profile"     element={<ProfilePage />} />
              <Route path="/student/settings"    element={<SettingsPage />} />
            </Route>

            {/* ── Faculty Routes ─────────────────────────────────────────────── */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <ShellLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/faculty/dashboard"  element={<FacultyDashboard />} />
              <Route path="/faculty/feedback"   element={<FacultyFeedbackView />} />
              <Route path="/faculty/analytics"  element={<FeedbackAnalytics />} />
              <Route path="/faculty/profile"    element={<ProfilePage />} />
              <Route path="/faculty/settings"   element={<SettingsPage />} />
            </Route>

            {/* ── Admin Routes ───────────────────────────────────────────────── */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ShellLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard"  element={<AdminDashboard />} />
              <Route path="/admin/analytics"  element={<AnalyticsPage />} />
              <Route path="/admin/responses"  element={<ResponsesPage />} />
              <Route path="/admin/users"      element={<UserManagement />} />
              <Route path="/admin/faculty"    element={<FacultyManagement />} />
              <Route path="/admin/courses"    element={<CourseManagement />} />
              <Route path="/admin/feedback"   element={<FeedbackManagement />} />
              <Route path="/admin/profile"    element={<ProfilePage />} />
              <Route path="/admin/settings"   element={<SettingsPage />} />
              {/* Legacy route aliases */}
              <Route path="/admin/forms"      element={<FeedbackManagement />} />
            </Route>

            {/* ── Error / Misc Pages ─────────────────────────────────────────── */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*"             element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
