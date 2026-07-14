import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const EyeIcon = ({ visible }) => (
  <Icon size={16} d={visible
    ? ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"]
    : ["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94",
       "M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19",
       "M1 1l22 22"]}
  />
);

/* Password strength meter */
const PasswordStrength = ({ password }) => {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Contains a symbol", met: /[!@#$%^&*]/.test(password) },
  ];
  const metCount = criteria.filter((c) => c.met).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#f87171", "#fbbf24", "#60a5fa", "#4ade80"];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
    >
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: i <= metCount ? colors[metCount] : "var(--bg-overlay)",
              transition: "background 0.3s",
            }}
          />
        ))}
        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: colors[metCount], marginLeft: "0.375rem", flexShrink: 0 }}>
          {levels[metCount]}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
        {criteria.map((c) => (
          <span
            key={c.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.66rem",
              color: c.met ? "#4ade80" : "var(--text-faint)",
              transition: "color 0.2s",
            }}
          >
            <Icon d={c.met ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"} size={10} strokeWidth={2.5} />
            {c.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const ResetPasswordPage = () => {
  const glowRef      = useCursorGlow();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const token        = params.get("token") || "demo-token";

  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [showP, setShowP]   = useState(false);
  const [showC, setShowC]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Must be at least 8 characters.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: form.password,
      });
      setDone(true);
    } catch (err) {
      setErrors({
        password:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to reset password. Please request a new link.",
      });
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
          src="/assets/auth/reset-image.jpg"
          alt="Set a new password"
          onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "linear-gradient(135deg, #0f0f20 0%, #0a0a14 100%)"; }}
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
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔐</div>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", lineHeight: 1.55 }}>
                Create a strong new password
              </p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                Use a mix of letters, numbers, and symbols for maximum security.
              </p>
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
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#4ade80",
                  }}
                >
                  <Icon d="M20 6L9 17l-5-5" size={24} strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h1 className="auth-heading" style={{ fontSize: "1.5rem" }}>Password updated!</h1>
                  <p className="auth-subheading">Your password has been reset successfully.</p>
                </div>
                <motion.button
                  className="btn-primary"
                  id="reset-done-btn"
                  style={{ width: "100%" }}
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  Continue to Sign in →
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: "1.875rem" }}>
                  <h1 className="auth-heading">Set new password</h1>
                  <p className="auth-subheading">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Password */}
                  <div className="field-group">
                    <label htmlFor="password" className="field-label">
                      New password <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>
                    </label>
                    <div className="field-input-wrap">
                      <input
                        id="password"
                        type={showP ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: "" })); }}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        className={`field-input has-icon-right${errors.password ? " is-error" : ""}`}
                      />
                      <span className="field-icon-right">
                        <button type="button" onClick={() => setShowP((v) => !v)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 0 }}
                          aria-label="Toggle password">
                          <EyeIcon visible={showP} />
                        </button>
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.password && (
                        <motion.div key={errors.password} className="field-error"
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                          <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={13} />
                          {errors.password}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <PasswordStrength password={form.password} />
                  </div>

                  {/* Confirm password */}
                  <div className="field-group">
                    <label htmlFor="confirm" className="field-label">
                      Confirm password <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>
                    </label>
                    <div className="field-input-wrap">
                      <input
                        id="confirm"
                        type={showC ? "text" : "password"}
                        value={form.confirm}
                        onChange={(e) => { setForm((p) => ({ ...p, confirm: e.target.value })); setErrors((p) => ({ ...p, confirm: "" })); }}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        className={`field-input has-icon-right${errors.confirm ? " is-error" : ""}`}
                      />
                      <span className="field-icon-right">
                        <button type="button" onClick={() => setShowC((v) => !v)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 0 }}
                          aria-label="Toggle confirm password">
                          <EyeIcon visible={showC} />
                        </button>
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.confirm && (
                        <motion.div key={errors.confirm} className="field-error"
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                          <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={13} />
                          {errors.confirm}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    id="reset-submit-btn"
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    whileHover={{ scale: loading ? 1 : 1.015 }}
                    whileTap={{ scale: loading ? 1 : 0.985 }}
                  >
                    {loading ? <><div className="spinner" />Updating password…</> : "Reset password"}
                  </motion.button>
                </form>

                <p style={{ marginTop: "1.75rem", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
                  <Link to="/login" className="link-brand">← Back to Sign in</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
