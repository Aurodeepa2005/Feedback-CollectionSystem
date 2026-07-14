import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Full-page loading screen ────────────────────────────────────────────────── */
export const LoadingScreen = ({ message = "Loading…" }) => (
  <div className="loading-screen">
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}
    >
      <span className="logo-mark">
        <span className="logo-icon">💬</span>
        <span className="logo-text">FeedbackHub</span>
      </span>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, ease: "linear", repeat: Infinity }}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2.5px solid rgba(99,102,241,0.2)",
          borderTopColor: "var(--brand)",
        }}
      />

      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{message}</p>
    </motion.div>
  </div>
);

/* ─── Inline spinner ─────────────────────────────────────────────────────────── */
export const Spinner = ({ size = 18, color = "#fff" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid rgba(255,255,255,0.2)`,
      borderTopColor: color,
      animation: "spin 0.65s linear infinite",
      flexShrink: 0,
      display: "inline-block",
    }}
  />
);

/* ─── Page-level skeleton pulse ─────────────────────────────────────────────── */
export const SkeletonLine = ({ width = "100%", height = 16, radius = 6, mb = 0 }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      background: "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite",
      marginBottom: mb,
    }}
  />
);

/* ─── Overlay loading (for page transitions) ─────────────────────────────────── */
export const LoadingOverlay = ({ visible = false }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10,10,10,0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9998,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(99,102,241,0.2)",
            borderTopColor: "var(--brand)",
          }}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

export default LoadingScreen;
