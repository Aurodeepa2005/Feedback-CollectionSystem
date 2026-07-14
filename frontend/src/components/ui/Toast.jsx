import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon, { ICONS } from "./Icon";

/* ─── Toast context ──────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

let toastIdCounter = 0;

/* ─── Toast Provider ─────────────────────────────────────────────────────────── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  // Convenience methods
  toast.success = (msg, opts) => toast({ type: "success", message: msg, ...opts });
  toast.error   = (msg, opts) => toast({ type: "error",   message: msg, ...opts });
  toast.warning = (msg, opts) => toast({ type: "warning", message: msg, ...opts });
  toast.info    = (msg, opts) => toast({ type: "info",    message: msg, ...opts });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

/* ─── useToast hook ──────────────────────────────────────────────────────────── */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

/* ─── Toast type config ──────────────────────────────────────────────────────── */
const TOAST_CONFIG = {
  success: {
    icon: ICONS["check-circle"],
    color: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
  },
  error: {
    icon: ICONS["x-circle"],
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
  },
  warning: {
    icon: ICONS.warning,
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
  info: {
    icon: ICONS.info,
    color: "var(--brand-hover)",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
  },
};

/* ─── Single toast item ──────────────────────────────────────────────────────── */
const ToastItem = ({ id, type = "info", title, message, onDismiss }) => {
  const cfg = TOAST_CONFIG[type] || TOAST_CONFIG.info;

  return (
    <motion.div
      layout
      key={id}
      initial={{ opacity: 0, x: 60, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.625rem",
        padding: "0.75rem 0.875rem",
        background: "var(--bg-elevated)",
        border: `1px solid ${cfg.border}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        maxWidth: 360,
        width: "100%",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: cfg.color,
        borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
      }} />

      {/* Icon */}
      <div style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>
        <Icon d={cfg.icon} size={15} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: message ? "0.15rem" : 0,
          }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          padding: 2,
          display: "flex",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <Icon d={ICONS.close} size={14} />
      </button>
    </motion.div>
  );
};

/* ─── Toast container ────────────────────────────────────────────────────────── */
const ToastContainer = ({ toasts, onDismiss }) => (
  <div
    aria-live="polite"
    aria-label="Notifications"
    style={{
      position: "fixed",
      top: "1.25rem",
      right: "1.25rem",
      zIndex: 9997,
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      pointerEvents: "none",
    }}
  >
    <AnimatePresence mode="sync">
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "all" }}>
          <ToastItem {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </AnimatePresence>
  </div>
);

export default ToastContainer;
