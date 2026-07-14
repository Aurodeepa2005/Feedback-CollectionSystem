import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Badge, Card } from "../../components/ui/PageHeader";
import { FormField, FormSection } from "../../components/ui/FormField";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

/* ─── Animation preset ───────────────────────────────────────────────────────── */
const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ─── Password strength meter ────────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)          score++;
    if (/[A-Z]/.test(p))        score++;
    if (/[0-9]/.test(p))        score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels   = ["", "Weak", "Fair", "Good", "Strong"];
  const colors   = ["", "#f87171", "#fbbf24", "#60a5fa", "#4ade80"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "0.35rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i <= strength ? 1 : 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i <= strength ? colors[strength] : "var(--bg-overlay)",
              transformOrigin: "left",
            }}
          />
        ))}
      </div>
      <p style={{
        fontSize: "0.7rem", fontWeight: 600,
        color: colors[strength] || "var(--text-faint)",
      }}>
        {labels[strength] || "Enter a password"}
      </p>
    </div>
  );
}

/* ─── Avatar Section ─────────────────────────────────────────────────────────── */
function AvatarSection({ name, role, roleLabel, joinDate }) {
  const [hovered, setHovered] = useState(false);
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "1rem", padding: "2rem",
      background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 100%)",
      border: "1px solid rgba(59,130,246,0.15)",
      borderRadius: "var(--radius-xl)",
      marginBottom: "1.5rem",
    }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative", cursor: "pointer" }}
      >
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.2rem", fontWeight: 800, color: "#fff",
          boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
          border: "3px solid rgba(255,255,255,0.12)",
          transition: "transform 0.2s",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}>
          {initials}
        </div>

        {/* Camera overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 4,
              }}
            >
              {/* Camera icon SVG inline */}
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span style={{ fontSize: "0.6rem", color: "#fff", fontWeight: 600 }}>Change</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)",
          letterSpacing: "-0.03em", marginBottom: "0.25rem",
        }}>
          {name}
        </h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <Badge variant={role} dot>{roleLabel}</Badge>
          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Joined {joinDate}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
        {[
          { label: "Submissions", value: "8" },
          { label: "Avg Rating", value: "4.2★" },
          { label: "Semester", value: "3rd" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{stat.value}</p>
            <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Inline success alert ───────────────────────────────────────────────────── */
function SuccessAlert({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: "flex", alignItems: "center", gap: "0.625rem",
        padding: "0.75rem 1rem",
        background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "var(--radius-sm)",
        color: "#4ade80", fontSize: "0.82rem", fontWeight: 600,
      }}
    >
      <Icon d={ICONS["check-circle"]} size={15} strokeWidth={2} />
      {message}
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user } = useAuth();

  const displayName = user?.name || user?.fullName || "Alex Johnson";
  const email       = user?.email || "alex.johnson@university.edu";
  const role        = user?.role || "student";
  const roleLabel   = role === "admin" ? "Admin" : role === "faculty" ? "Faculty" : "Student";

  // Personal info state
  const [info, setInfo] = useState({
    fullName:   displayName,
    email,
    studentId:  user?.studentId || "N/A",
    department: user?.department || "Computer Science",
    bio:        user?.bio || "",
  });
  const [infoSaving,   setInfoSaving]   = useState(false);
  const [infoSuccess,  setInfoSuccess]  = useState(false);

  // Password state
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError,   setPwError]   = useState("");

  // Show/hide toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/me");
        const data = response.data;
        setInfo({
          fullName: data.name,
          email: data.email,
          studentId: data.studentId || "N/A",
          department: data.department || "Computer Science",
          bio: data.bio || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile info", err);
      }
    };
    fetchProfile();
  }, []);

  const handleInfoSave = async () => {
    setInfoSaving(true);
    try {
      const response = await axiosInstance.put("/users/me", {
        name: info.fullName,
        department: info.department,
        bio: info.bio
      });
      // Sync localStorage so AuthContext user stays updated
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...savedUser,
        name: response.data.name,
        department: response.data.department,
        bio: response.data.bio
      }));
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setInfoSaving(false);
    }
  };

  const handlePwSave = async () => {
    setPwError("");
    if (!pw.current) { setPwError("Current password is required."); return; }
    if (pw.newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pw.newPw !== pw.confirm) { setPwError("Passwords do not match."); return; }

    setPwSaving(true);
    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword: pw.current,
        newPassword: pw.newPw
      });
      setPwSuccess(true);
      setPw({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err?.response?.data?.message || err?.response?.data?.error || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const EyeBtn = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}
    >
      <Icon d={show ? ICONS["eye-off"] : ICONS.eye} size={15} strokeWidth={2} />
    </button>
  );

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and account security"
        breadcrumb={[roleLabel, "Profile"]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Avatar Section */}
          <AvatarSection
            name={info.fullName}
            role={role}
            roleLabel={roleLabel}
            joinDate="September 2024"
          />

          {/* Personal Information */}
          <FormSection
            title="Personal Information"
            description="Update your profile details visible in the system"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FormField
                id="profile-fullname"
                label="Full Name"
                value={info.fullName}
                onChange={(e) => setInfo((s) => ({ ...s, fullName: e.target.value }))}
                placeholder="Your full name"
                index={0}
              />

              <FormField
                id="profile-email"
                label="Email Address"
                type="email"
                value={info.email}
                onChange={() => {}}
                disabled
                rightEl={
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "0.1rem 0.45rem", borderRadius: 99,
                    fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase",
                    background: "rgba(34,197,94,0.1)", color: "#4ade80",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}>
                    <Icon d={ICONS["check-circle"]} size={10} strokeWidth={2.5} />
                    Verified
                  </span>
                }
                index={1}
              />

              <FormField
                id="profile-student-id"
                label="Student ID"
                value={info.studentId}
                onChange={() => {}}
                disabled
                index={2}
              />

              <FormField
                id="profile-dept"
                label="Department"
                as="select"
                value={info.department}
                onChange={(e) => setInfo((s) => ({ ...s, department: e.target.value }))}
                index={3}
              >
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>English</option>
                <option>Mechanical Engineering</option>
                <option>Business Administration</option>
              </FormField>

              <FormField
                id="profile-bio"
                label="Bio"
                as="textarea"
                rows={4}
                value={info.bio}
                onChange={(e) => setInfo((s) => ({ ...s, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself..."
                index={4}
              />

              <AnimatePresence>{infoSuccess && <SuccessAlert message="Profile updated successfully!" />}</AnimatePresence>

              <motion.button
                className="btn-primary"
                onClick={handleInfoSave}
                disabled={infoSaving}
                whileHover={{ scale: infoSaving ? 1 : 1.02 }}
                whileTap={{ scale: infoSaving ? 1 : 0.97 }}
                style={{
                  height: 42, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  opacity: infoSaving ? 0.7 : 1,
                  fontSize: "0.85rem",
                }}
              >
                {infoSaving ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                ) : (
                  <><Icon d={ICONS.check} size={15} strokeWidth={2.5} />Save Profile</>
                )}
              </motion.button>
            </div>
          </FormSection>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Change Password */}
          <FormSection
            title="Change Password"
            description="Keep your account secure with a strong password"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FormField
                id="pw-current"
                label="Current Password"
                type={showCurrent ? "text" : "password"}
                value={pw.current}
                onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))}
                placeholder="Enter current password"
                rightEl={<EyeBtn show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />}
                index={0}
              />

              <div>
                <FormField
                  id="pw-new"
                  label="New Password"
                  type={showNew ? "text" : "password"}
                  value={pw.newPw}
                  onChange={(e) => setPw((s) => ({ ...s, newPw: e.target.value }))}
                  placeholder="At least 8 characters"
                  rightEl={<EyeBtn show={showNew} onToggle={() => setShowNew(!showNew)} />}
                  index={1}
                />
                <PasswordStrength password={pw.newPw} />
              </div>

              <FormField
                id="pw-confirm"
                label="Confirm New Password"
                type={showConfirm ? "text" : "password"}
                value={pw.confirm}
                onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))}
                placeholder="Repeat new password"
                rightEl={<EyeBtn show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />}
                error={pw.confirm && pw.newPw && pw.confirm !== pw.newPw ? "Passwords do not match" : undefined}
                index={2}
              />

              <AnimatePresence>
                {pwError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="alert-error"
                    style={{ fontSize: "0.78rem" }}
                  >
                    <Icon d={ICONS.warning} size={14} strokeWidth={2} />
                    {pwError}
                  </motion.div>
                )}
                {pwSuccess && <SuccessAlert message="Password changed successfully!" />}
              </AnimatePresence>

              <motion.button
                className="btn-primary"
                onClick={handlePwSave}
                disabled={pwSaving}
                whileHover={{ scale: pwSaving ? 1 : 1.02 }}
                whileTap={{ scale: pwSaving ? 1 : 0.97 }}
                style={{
                  height: 42, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  opacity: pwSaving ? 0.7 : 1,
                  fontSize: "0.85rem",
                }}
              >
                {pwSaving ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Updating…</>
                ) : (
                  <><Icon d={ICONS.lock} size={15} strokeWidth={2} />Update Password</>
                )}
              </motion.button>
            </div>
          </FormSection>

          {/* Account Activity */}
          <FormSection
            title="Account Activity"
            description="Your recent account information"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "Last Login",          value: "Today, 5:47 PM",    icon: ICONS.activity,        color: "#4ade80" },
                { label: "Account Created",     value: "September 4, 2024", icon: ICONS.calendar,        color: "#3B82F6" },
                { label: "Total Submissions",   value: "8 feedbacks",       icon: ICONS["check-circle"], color: "#f59e0b" },
                { label: "Profile Completeness", value: "92%",              icon: ICONS.percent,         color: "#8B5CF6" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.875rem",
                    padding: "0.875rem 0",
                    borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: `${item.color}14`,
                    border: `1px solid ${item.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.color, flexShrink: 0,
                  }}>
                    <Icon d={item.icon} size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.1rem" }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        </div>
      </div>
    </motion.div>
  );
}
