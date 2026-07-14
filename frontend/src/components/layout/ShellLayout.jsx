import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Footer from "./Footer";

/* ─── SVG Icon primitive ──────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, strokeWidth = 1.75 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    className="sidebar-link-icon"
  >
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* ─── Icon paths ────────────────────────────────────────────────────────────── */
const ICONS = {
  dashboard:   ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
  forms:       ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8"],
  feedback:    ["M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
  analytics:   ["M18 20V10", "M12 20V4", "M6 20v-6"],
  responses:   ["M9 11l3 3L22 4", "M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"],
  logout:      ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  menu:        ["M3 12h18", "M3 6h18", "M3 18h18"],
  close:       ["M18 6L6 18", "M6 6l12 12"],
  user:        ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  users:       ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75", "M9 11a4 4 0 100-8 4 4 0 000 8z"],
  settings:    ["M12 15a3 3 0 100-6 3 3 0 000 6z", "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  book:        ["M4 19.5A2.5 2.5 0 016.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"],
  shield:      ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  "bar-chart": ["M18 20V10", "M12 20V4", "M6 20v-6"],
  "clipboard": ["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2","M9 5a2 2 0 002 2h2a2 2 0 002-2","M9 5a2 2 0 012-2h2a2 2 0 012 2"],
  profile:     ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  chevron:     "M9 18l6-6-6-6",
};

/* ─── Nav config per role ────────────────────────────────────────────────────── */
const NAV = {
  student: {
    sections: [
      {
        label: "Navigation",
        items: [
          { to: "/student/dashboard",  label: "Dashboard",       icon: ICONS.dashboard },
          { to: "/student/forms",      label: "Feedback Forms",  icon: ICONS.forms },
          { to: "/student/my-feedback",label: "My Feedback",     icon: ICONS.feedback },
        ],
      },
      {
        label: "Account",
        items: [
          { to: "/student/profile",   label: "Profile",          icon: ICONS.profile },
          { to: "/student/settings",  label: "Settings",         icon: ICONS.settings },
        ],
      },
    ],
  },
  faculty: {
    sections: [
      {
        label: "Navigation",
        items: [
          { to: "/faculty/dashboard",  label: "Dashboard",       icon: ICONS.dashboard },
          { to: "/faculty/feedback",   label: "Feedback Received",icon: ICONS.feedback },
          { to: "/faculty/analytics",  label: "Analytics",       icon: ICONS["bar-chart"] },
        ],
      },
      {
        label: "Account",
        items: [
          { to: "/faculty/profile",   label: "Profile",          icon: ICONS.profile },
          { to: "/faculty/settings",  label: "Settings",         icon: ICONS.settings },
        ],
      },
    ],
  },
  admin: {
    sections: [
      {
        label: "Overview",
        items: [
          { to: "/admin/dashboard",   label: "Dashboard",        icon: ICONS.dashboard },
          { to: "/admin/analytics",   label: "Analytics",        icon: ICONS["bar-chart"] },
          { to: "/admin/responses",   label: "Responses",        icon: ICONS.responses },
        ],
      },
      {
        label: "Management",
        items: [
          { to: "/admin/users",       label: "Users",            icon: ICONS.users },
          { to: "/admin/faculty",     label: "Faculty",          icon: ICONS.shield },
          { to: "/admin/courses",     label: "Courses",          icon: ICONS.book },
          { to: "/admin/feedback",    label: "Feedback Forms",   icon: ICONS.forms },
        ],
      },
      {
        label: "Account",
        items: [
          { to: "/admin/profile",     label: "Profile",          icon: ICONS.profile },
          { to: "/admin/settings",    label: "Settings",         icon: ICONS.settings },
        ],
      },
    ],
  },
};

/* ─── Badge variant map ─────────────────────────────────────────────────────── */
const ROLE_BADGE = {
  student: "badge-student",
  faculty: "badge-faculty",
  admin:   "badge-admin",
};

/* ─── Sidebar component ─────────────────────────────────────────────────────── */
const Sidebar = ({ isOpen, onClose, navConfig, user }) => {
  const itemVariants = {
    hidden:  { opacity: 0, x: -10 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.22, ease: "easeOut" } }),
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isOpen ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${isOpen ? " is-open" : ""}`} aria-label="Navigation">

        {/* Logo */}
        <div className="sidebar-header">
          <Link to="/" className="logo-mark" style={{ textDecoration: "none" }}>
            <span className="logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>💬</span>
            <span className="logo-text">FeedbackHub</span>
          </Link>
        </div>

        {/* User chip */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{
              fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3,
            }}>
              {user?.name ?? "User"}
            </div>
            <span className={`badge ${ROLE_BADGE[user?.role] ?? "badge-student"}`}>
              {user?.role ?? "student"}
            </span>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {(navConfig?.sections ?? []).map((section) => (
            <div key={section.label}>
              <span className="sidebar-section-label">{section.label}</span>
              {section.items.map((item, i) => (
                <motion.div
                  key={item.to}
                  variants={itemVariants}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                    onClick={onClose}
                  >
                    <Icon d={item.icon} size={15} />
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

/* ─── Navbar component ──────────────────────────────────────────────────────── */
const Navbar = ({ onMenuToggle, user, onLogout }) => (
  <header className="navbar" role="banner">
    <div className="navbar-left">
      <motion.button
        className="btn-ghost"
        onClick={onMenuToggle}
        id="mobile-menu-btn"
        aria-label="Toggle sidebar"
        style={{
          width: 36, height: 36, padding: 0, border: "1px solid var(--border)",
          borderRadius: 8, display: "none", alignItems: "center", justifyContent: "center",
        }}
        whileTap={{ scale: 0.9 }}
      >
        <Icon d={ICONS.menu} size={16} strokeWidth={2} />
      </motion.button>

      <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 0.25rem" }} className="hidden-on-mobile" />
      <span className="navbar-title" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
        Feedback Collection System
      </span>
    </div>

    <div className="navbar-right">
      {/* User chip */}
      <div className="navbar-user-chip">
        <div className="sidebar-avatar" style={{ width: 24, height: 24, fontSize: "0.65rem" }}>
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {user?.name ?? "User"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{user?.email ?? ""}</div>
        </div>
      </div>

      {/* Logout */}
      <motion.button
        className="btn-ghost"
        onClick={onLogout}
        id="logout-btn"
        style={{ gap: "0.375rem", height: 34, fontSize: "0.78rem" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
      >
        <Icon d={ICONS.logout} size={14} strokeWidth={2} />
        Logout
      </motion.button>
    </div>
  </header>
);

/* ─── ShellLayout ───────────────────────────────────────────────────────────── */
const ShellLayout = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navConfig = NAV[user?.role] ?? NAV.student;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navConfig={navConfig}
        user={user}
      />

      <div className="main-area">
        <Navbar
          onMenuToggle={() => setSidebarOpen((p) => !p)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="main-content" id="main-content" role="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* Mobile hamburger */}
      <style>{`
        @media (max-width: 1023px) {
          #mobile-menu-btn { display: flex !important; }
          .hidden-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ShellLayout;
