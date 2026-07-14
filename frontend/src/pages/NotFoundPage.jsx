import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const NotFoundPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const dashPath = user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

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
        position: "absolute", top: "5%", right: "10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "5%", left: "10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <motion.div
        style={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.75rem",
          position: "relative",
          zIndex: 1,
        }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Giant 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ lineHeight: 1, userSelect: "none" }}
        >
          <span style={{
            fontSize: "clamp(7rem, 20vw, 10rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(34,211,238,0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
            filter: "drop-shadow(0 0 60px rgba(99,102,241,0.2))",
          }}>
            404
          </span>
        </motion.div>

        {/* Status pill */}
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
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "var(--brand-hover)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", flexShrink: 0 }} />
          Page Not Found
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.45 }}
        >
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--text-primary)",
            marginBottom: "0.625rem",
          }}>
            This page doesn't exist
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: 380,
            margin: "0 auto",
          }}>
            The URL you visited may have been removed, renamed, or is temporarily unavailable.
            Double-check the address or navigate back.
          </p>
        </motion.div>

        {/* Path display */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "0.75rem 1.125rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.625rem",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <code style={{
            fontFamily: "ui-monospace, 'Cascadia Code', monospace",
            fontSize: "0.78rem",
            color: "var(--brand-hover)",
            background: "var(--brand-muted)",
            padding: "0.1rem 0.4rem",
            borderRadius: 5,
          }}>
            {window.location.pathname}
          </code>
          <span>was not found</span>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to={dashPath} className="btn-primary" id="home-link">
                Back to Dashboard
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="btn-primary" id="home-link">
                Go to Login
              </Link>
            </motion.div>
          )}
          <motion.button
            className="btn-ghost"
            onClick={() => navigate(-1)}
            id="go-back-404-btn"
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

export default NotFoundPage;
