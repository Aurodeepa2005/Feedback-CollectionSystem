import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useCursorGlow from "../../utils/useCursorGlow";
import axiosInstance from "../../api/axiosInstance";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};
const leftPanelVariants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const formVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 } },
};

const Icon = ({ d, size = 16, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ForgotPasswordPage = () => {
  const glowRef = useCursorGlow();
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="auth-split" variants={pageVariants} initial="initial" animate="animate">
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />

      {/* Left panel */}
      <motion.div className="auth-panel-left" variants={leftPanelVariants} initial="initial" animate="animate">
        <img
          src="/assets/auth/forgot-image.jpg"
          alt="Reset your password"
          onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "linear-gradient(135deg, #0d0d1a 0%, #13131f 100%)"; }}
        />
        <div className="auth-panel-left-content">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            <span className="logo-mark">
              <span className="logo-icon">💬</span>
              <span className="logo-text" style={{ color: "#fff" }}>FeedbackHub</span>
            </span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }}>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "1.5rem",
              maxWidth: 380,
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔒</div>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", lineHeight: 1.55, letterSpacing: "-0.01em" }}>
                Forgot your password?
              </p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                No worries. Enter your email and we'll send you a reset link within minutes.
              </p>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Secure link", "Expires in 15 min", "One-time use"].map((f) => (
                  <span key={f} style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 99,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <motion.div className="auth-form-container" variants={formVariants} initial="initial" animate="animate">
          <div style={{ marginBottom: "2rem" }}>
            <span className="logo-mark">
              <span className="logo-icon">💬</span>
              <span className="logo-text">FeedbackHub</span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4ade80",
                  }}
                >
                  <Icon d="M20 6L9 17l-5-5" size={24} strokeWidth={2.5} />
                </motion.div>

                <div>
                  <h1 className="auth-heading" style={{ fontSize: "1.5rem" }}>Check your inbox</h1>
                  <p className="auth-subheading" style={{ marginTop: "0.5rem" }}>
                    We've sent a password reset link to
                  </p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--brand-hover)", marginTop: "0.25rem" }}>
                    {email}
                  </p>
                </div>

                <div className="alert-success" style={{ width: "100%", textAlign: "left" }}>
                  <Icon d={["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"]} size={14} />
                  The link expires in 15 minutes. Check your spam folder if you don't see it.
                </div>

                <button
                  className="btn-ghost"
                  style={{ width: "100%" }}
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  Try a different email
                </button>

                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  <Link to="/login" className="link-brand">← Back to Sign in</Link>
                </p>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: "1.875rem" }}>
                  <h1 className="auth-heading">Reset your password</h1>
                  <p className="auth-subheading">We'll email you a secure link to reset it.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="field-group">
                    <label htmlFor="email" className="field-label">
                      Email address <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>
                    </label>
                    <div className="field-input-wrap">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="you@example.com"
                        className={`field-input${error ? " is-error" : ""}`}
                        autoComplete="email"
                      />
                    </div>
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          key={error}
                          className="field-error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={13} />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    id="forgot-submit-btn"
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    whileHover={{ scale: loading ? 1 : 1.015 }}
                    whileTap={{ scale: loading ? 1 : 0.985 }}
                  >
                    {loading
                      ? <><div className="spinner" />Sending link…</>
                      : "Send reset link"}
                  </motion.button>
                </form>

                <p style={{ marginTop: "1.75rem", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
                  Remembered your password?{" "}
                  <Link to="/login" className="link-brand">Sign in</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
