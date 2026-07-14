import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useCursorGlow from "../../utils/useCursorGlow";

/* ─── Variants ─────────────────────────────────────────────────────────────── */
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
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 },
  },
};

const fieldVariants = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.25 + i * 0.07 },
  }),
};

/* ─── Reusable icon ────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

/* ─── Eye toggle icon ──────────────────────────────────────────────────────── */
const EyeIcon = ({ visible }) => (
  <Icon size={16} strokeWidth={1.75} d={
    visible
      ? ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"]
      : [
        "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94",
        "M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19",
        "M1 1l22 22",
      ]
  } />
);

/* ─── Field wrapper ────────────────────────────────────────────────────────── */
const Field = ({ id, label, type = "text", value, onChange, placeholder, error, required, rightEl, index = 0 }) => (
  <motion.div className="field-group" variants={fieldVariants} custom={index} initial="initial" animate="animate">
    <label htmlFor={id} className="field-label">
      {label}{required && <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>}
    </label>
    <div className="field-input-wrap">
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        required={required}
        autoComplete={type === "password" ? "current-password" : undefined}
        className={`field-input${error ? " is-error" : ""}${rightEl ? " has-icon-right" : ""}`}
      />
      {rightEl && <span className="field-icon-right">{rightEl}</span>}
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
  </motion.div>
);

/* ─── LoginPage ─────────────────────────────────────────────────────────────── */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const glowRef    = useCursorGlow();

  const [form,      setForm]      = useState({ email: "", password: "" });
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  /* ── Validation ──────────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Must be at least 6 characters.";
    return e;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(p => ({ ...p, [id]: value }));
    setErrors(p => ({ ...p, [id]: "" }));
    setApiError("");
  };

  /* ── Submit ──────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    setApiError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard", { replace: true });
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="auth-split" variants={pageVariants} initial="initial" animate="animate">
      {/* Cursor glow */}
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />

      {/* ── Left Image Panel ────────────────────────────────────────────────── */}
      <motion.div className="auth-panel-left" variants={leftPanelVariants} initial="initial" animate="animate">
        <img
          src="/assets/auth/login-image.jpg"
          alt="Welcome to FeedbackHub"
          onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = "linear-gradient(135deg, #13131f 0%, #0d0d1a 100%)"; }}
        />

        {/* Floating content over image */}
        <div className="auth-panel-left-content">
          {/* Top logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            <span className="logo-mark">
              <span className="logo-icon">💬</span>
              <span className="logo-text" style={{ color: "#fff" }}>FeedbackHub</span>
            </span>
          </motion.div>

          {/* Bottom text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Pull-quote */}
            <div style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "1.5rem",
              maxWidth: 380,
            }}>
              <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff", lineHeight: 1.55, letterSpacing: "-0.01em" }}>
                "The simplest way to understand what your students are thinking."
              </p>
              <div style={{ marginTop: "0.875rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>
                  FH
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>FeedbackHub Team</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Feedback Collection System</div>
                </div>
              </div>
            </div>

            {/* Tiny feature pills */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Real-time responses", "Role-based access", "Analytics"].map((f) => (
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
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right Form Panel ────────────────────────────────────────────────── */}
      <div className="auth-panel-right">
        <motion.div className="auth-form-container" variants={formVariants} initial="initial" animate="animate">

          {/* Mobile logo — visible only < lg */}
          <div style={{ marginBottom: "2rem" }} className="lg:hidden">
            <span className="logo-mark">
              <span className="logo-icon">💬</span>
              <span className="logo-text">FeedbackHub</span>
            </span>
          </div>

          {/* Headings */}
          <div style={{ marginBottom: "1.875rem" }}>
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to continue to your workspace.</p>
          </div>

          {/* API error */}
          <AnimatePresence mode="wait">
            {apiError && (
              <motion.div
                key="api-err"
                className="alert-error"
                style={{ marginBottom: "1.25rem" }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={15} />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field id="email" label="Email address" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" error={errors.email} required index={0} />

            <Field id="password" label="Password" type={showPass ? "text" : "password"}
              value={form.password} onChange={handleChange} placeholder="••••••••"
              error={errors.password} required index={1}
              rightEl={
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 0 }}
                  aria-label={showPass ? "Hide password" : "Show password"}>
                  <EyeIcon visible={showPass} />
                </button>
              }
            />

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginTop: "-0.375rem" }}>
              <Link to="/forgot-password" className="link-brand" style={{ fontSize: "0.78rem" }}>
                Forgot password?
              </Link>
            </div>


            {/* Submit */}
            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="login-submit-btn"
              style={{ width: "100%", marginTop: "0.5rem" }}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
            >
              {loading ? <><div className="spinner" />Signing in…</> : "Sign in"}
            </motion.button>
          </form>

          {/* Footer */}
          <p style={{ marginTop: "1.75rem", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/register" className="link-brand">Create one</Link>
          </p>

          {/* Legal */}
          <p style={{ marginTop: "2.5rem", fontSize: "0.7rem", color: "var(--text-faint)", textAlign: "center", lineHeight: 1.6 }}>
            By signing in you agree to our{" "}
            <span style={{ color: "var(--text-muted)" }}>Terms of Service</span> and{" "}
            <span style={{ color: "var(--text-muted)" }}>Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
