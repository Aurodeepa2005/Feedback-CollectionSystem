import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useCursorGlow from "../../utils/useCursorGlow";

/* ─── Animation variants ────────────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};
const leftVariants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const formVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 } },
};
const fieldVariants = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.25 + i * 0.065 } }),
};

/* ─── Icon ──────────────────────────────────────────────────────────────────── */
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

/* ─── Field component ───────────────────────────────────────────────────────── */
const Field = ({ id, label, type = "text", value, onChange, placeholder, error, required, rightEl, index = 0 }) => (
  <motion.div className="field-group" variants={fieldVariants} custom={index} initial="initial" animate="animate">
    <label htmlFor={id} className="field-label">
      {label}{required && <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>}
    </label>
    <div className="field-input-wrap">
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        required={required}
        autoComplete={type === "password" ? "new-password" : undefined}
        className={`field-input${error ? " is-error" : ""}${rightEl ? " has-icon-right" : ""}`}
      />
      {rightEl && <span className="field-icon-right">{rightEl}</span>}
    </div>
    <AnimatePresence mode="wait">
      {error && (
        <motion.div key={error} className="field-error"
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
          <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={13} />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ─── Role Card ─────────────────────────────────────────────────────────────── */
const RoleCard = ({ value, label, emoji, desc, selected, onSelect }) => (
  <motion.button
    type="button"
    onClick={() => onSelect(value)}
    id={`role-${value}`}
    className={`role-card${selected ? " selected" : ""}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    style={{ position: "relative", overflow: "hidden" }}
  >
    {selected && (
      <motion.div
        layoutId="role-indicator"
        style={{
          position: "absolute", inset: 0,
          background: "rgba(99,102,241,0.06)",
          borderRadius: "inherit",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    )}
    <span className="role-card-icon">{emoji}</span>
    <span className="role-card-label">{label}</span>
    {desc && <span style={{ fontSize: "0.65rem", color: "var(--text-faint)", lineHeight: 1.4 }}>{desc}</span>}
  </motion.button>
);

/* ─── RegisterPage ──────────────────────────────────────────────────────────── */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const glowRef      = useCursorGlow();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "student",
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  /* ── Validation ────────────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Must be at least 2 characters.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Must be at least 6 characters.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) e.password = "Include at least one letter and one number.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(p => ({ ...p, [id]: value }));
    setErrors(p => ({ ...p, [id]: "" }));
    setApiError("");
  };

  /* ── Submit ─────────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    setApiError("");
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard", { replace: true });
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <motion.div className="auth-split" variants={pageVariants} initial="initial" animate="animate">
      {/* Cursor glow */}
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />

      {/* ── Left panel ────────────────────────────────────────────────────────── */}
      <motion.div className="auth-panel-left" variants={leftVariants} initial="initial" animate="animate">
        <img
          src="/assets/auth/register-image.jpg"
          alt="Join FeedbackHub"
          onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = "linear-gradient(135deg, #0d0d1a 0%, #13131f 100%)"; }}
        />

        <div className="auth-panel-left-content">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            <span className="logo-mark">
              <span className="logo-icon">💬</span>
              <span className="logo-text" style={{ color: "#fff" }}>FeedbackHub</span>
            </span>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.65 }}
          >
            <div style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: "1.75rem",
              maxWidth: 380,
            }}>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "1rem" }}>
                What you'll get
              </p>
              {[
                { icon: "🎯", title: "Targeted feedback forms", desc: "Collect structured responses from students." },
                { icon: "📊", title: "Real-time analytics", desc: "Visualize trends and patterns instantly." },
                { icon: "🔒", title: "Role-based access", desc: "Separate views for students and admins." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.1, duration: 0.4 }}
                  style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: i < 2 ? "1rem" : 0 }}
                >
                  <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.05rem" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{item.title}</div>
                    <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.45)", marginTop: "0.1rem" }}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right form panel ──────────────────────────────────────────────────── */}
      <div className="auth-panel-right" style={{ overflowY: "auto" }}>
        <motion.div className="auth-form-container" variants={formVariants} initial="initial" animate="animate">

          {/* Mobile logo */}
          <div style={{ marginBottom: "2rem" }}>
            <span className="logo-mark">
              <span className="logo-icon">💬</span>
              <span className="logo-text">FeedbackHub</span>
            </span>
          </div>

          {/* Headings */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 className="auth-heading">Create your account</h1>
            <p className="auth-subheading">Start collecting feedback in minutes.</p>
          </div>

          {/* API error */}
          <AnimatePresence mode="wait">
            {apiError && (
              <motion.div key="api-err" className="alert-error" style={{ marginBottom: "1.25rem" }}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={15} />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

            {/* Role */}
            <motion.div className="field-group" variants={fieldVariants} custom={0} initial="initial" animate="animate">
              <span className="field-label">I am a *</span>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <RoleCard value="student" label="Student" emoji="🎓" desc="Browse & submit"
                  selected={form.role === "student"} onSelect={v => setForm(p => ({ ...p, role: v }))} />
                <RoleCard value="admin" label="Admin" emoji="🛡️" desc="Create & manage"
                  selected={form.role === "admin"} onSelect={v => setForm(p => ({ ...p, role: v }))} />
              </div>
            </motion.div>

            <Field id="name" label="Full name" value={form.name} onChange={handleChange}
              placeholder="Jane Doe" error={errors.name} required index={1} />

            <Field id="email" label="Email address" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" error={errors.email} required index={2} />

            <Field id="password" label="Password" type={showPass ? "text" : "password"}
              value={form.password} onChange={handleChange} placeholder="Min. 6 chars + number"
              error={errors.password} required index={3}
              rightEl={
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 0 }}
                  aria-label="Toggle password">
                  <EyeIcon visible={showPass} />
                </button>
              }
            />

            <Field id="confirmPassword" label="Confirm password" type={showConf ? "text" : "password"}
              value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
              error={errors.confirmPassword} required index={4}
              rightEl={
                <button type="button" onClick={() => setShowConf(p => !p)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 0 }}
                  aria-label="Toggle confirm password">
                  <EyeIcon visible={showConf} />
                </button>
              }
            />

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="register-submit-btn"
              style={{ width: "100%", marginTop: "0.5rem" }}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
            >
              {loading ? <><div className="spinner" />Creating account…</> : "Create account"}
            </motion.button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" className="link-brand">Sign in</Link>
          </p>

          <p style={{ marginTop: "2rem", fontSize: "0.7rem", color: "var(--text-faint)", textAlign: "center", lineHeight: 1.6 }}>
            By creating an account you agree to our{" "}
            <span style={{ color: "var(--text-muted)" }}>Terms of Service</span> and{" "}
            <span style={{ color: "var(--text-muted)" }}>Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
