import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDashboard = () => {
    navigate(user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{
        position: "absolute", top: "10%", left: "15%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <motion.div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Status icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          🚫
        </motion.div>

        {/* Code pill */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.3rem 0.875rem",
            borderRadius: 99,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
            color: "#f87171",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
          403 — Access Forbidden
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1.1,
            marginBottom: "0.625rem",
          }}>
            Access Denied
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            maxWidth: 360,
            margin: "0 auto",
          }}>
            You don't have the permissions required to view this page.
            This area is restricted to a specific role.
          </p>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            width: "100%",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.55, textAlign: "left" }}>
            Your current role is <strong style={{ color: "var(--text-secondary)" }}>{user?.role ?? "unknown"}</strong>.
            Contact your administrator if you believe this is a mistake.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          <motion.button
            className="btn-primary"
            onClick={handleDashboard}
            id="go-to-dashboard-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Go to My Dashboard
          </motion.button>
          <motion.button
            className="btn-ghost"
            onClick={() => navigate(-1)}
            id="go-back-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
