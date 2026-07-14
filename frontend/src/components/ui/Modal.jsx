import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon, { ICONS } from "./Icon";
import { Spinner } from "./LoadingSpinner";

/**
 * Confirmation Modal
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onConfirm: () => void
 *  - title: string
 *  - message: string | ReactNode
 *  - confirmLabel: string  (default: "Confirm")
 *  - cancelLabel: string   (default: "Cancel")
 *  - variant: "danger" | "warning" | "default"
 *  - loading: boolean
 */
const Modal = ({
  open = false,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  children,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const confirmStyle = {
    danger: {
      background: "rgba(239,68,68,0.12)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.3)",
      hoverBg: "rgba(239,68,68,0.2)",
    },
    warning: {
      background: "rgba(245,158,11,0.12)",
      color: "#fbbf24",
      border: "1px solid rgba(245,158,11,0.3)",
      hoverBg: "rgba(245,158,11,0.2)",
    },
    default: {
      background: "var(--brand)",
      color: "#fff",
      border: "none",
      hoverBg: "#7678f5",
    },
  }[variant] || {};

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 8888,
            }}
          />

          {/* Centering wrapper — keeps translate(-50%,-50%) separate from Framer Motion transforms */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 8889,
              width: "min(440px, calc(100vw - 2rem))",
            }}
          >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
              <h2
                id="modal-title"
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                disabled={loading}
                aria-label="Close modal"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 4,
                  display: "flex",
                  borderRadius: 6,
                  flexShrink: 0,
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-highlight)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              >
                <Icon d={ICONS.close} size={16} />
              </button>
            </div>

            {/* Body */}
            {(message || children) && (
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {children || message}
              </div>
            )}

            {/* Actions */}
            {onConfirm && (
              <div style={{ display: "flex", gap: "0.625rem", justifyContent: "flex-end" }}>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="btn-ghost"
                  style={{ height: 38, fontSize: "0.82rem" }}
                >
                  {cancelLabel}
                </button>
                <motion.button
                  onClick={onConfirm}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  style={{
                    height: 38,
                    padding: "0 1.125rem",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    fontFamily: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    opacity: loading ? 0.6 : 1,
                    transition: "all 0.15s",
                    ...confirmStyle,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && confirmStyle.hoverBg) e.currentTarget.style.background = confirmStyle.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.background = confirmStyle.background;
                  }}
                >
                  {loading && <Spinner size={14} color={confirmStyle.color} />}
                  {confirmLabel}
                </motion.button>
              </div>
            )}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
