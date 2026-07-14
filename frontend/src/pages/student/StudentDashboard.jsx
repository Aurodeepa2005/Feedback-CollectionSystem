import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import { StarRating } from "../../components/ui/Charts";
import { Badge } from "../../components/ui/PageHeader";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

/* ─── Animation preset ───────────────────────────────────────────────────────── */
const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// State-driven lists will be loaded dynamically from the backend APIs

/* ─── Deadline badge helper ──────────────────────────────────────────────────── */
function DeadlineBadge({ deadline }) {
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  let color, bg, label;
  if (days < 3)       { color = "#f87171"; bg = "rgba(239,68,68,0.12)";     label = `${days}d left`; }
  else if (days < 7)  { color = "#fbbf24"; bg = "rgba(245,158,11,0.12)";    label = `${days}d left`; }
  else                { color = "#4ade80"; bg = "rgba(34,197,94,0.1)";       label = `${days}d left`; }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "0.2rem 0.55rem", borderRadius: 99,
      fontSize: "0.68rem", fontWeight: 700, color, background: bg,
      border: `1px solid ${color}30`,
    }}>
      <Icon d={ICONS.calendar} size={10} strokeWidth={2} />
      {label}
    </span>
  );
}

/* ─── Form Card ──────────────────────────────────────────────────────────────── */
function FormCard({ form, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 + index * 0.07 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ y: -2 }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${form.color}50`;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${form.color}20, var(--shadow-md)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: `radial-gradient(circle, ${form.color}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${form.color}18`, border: `1px solid ${form.color}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: form.color, flexShrink: 0,
        }}>
          <Icon d={ICONS.forms} size={18} strokeWidth={1.75} />
        </div>
        <DeadlineBadge deadline={form.deadline} />
      </div>

      {/* Subject info */}
      <div>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: form.color, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
          {form.code}
        </div>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em", lineHeight: 1.3, marginBottom: "0.2rem" }}>
          {form.subject}
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{form.faculty}</p>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{ fontSize: "0.73rem", color: "var(--text-faint)" }}>
          {form.responses} responses
        </span>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            height: 32, padding: "0 0.875rem",
            borderRadius: "var(--radius-sm)",
            background: `${form.color}18`,
            border: `1px solid ${form.color}35`,
            color: form.color,
            fontSize: "0.76rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 4,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${form.color}28`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${form.color}18`; }}
        >
          Submit Feedback
          <Icon d={ICONS["arrow-right"]} size={12} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, subsRes] = await Promise.all([
          axiosInstance.get("/student/forms"),
          axiosInstance.get("/student/my-feedback")
        ]);
        setForms(formsRes.data);
        setSubmissions(subsRes.data);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = user?.name || user?.fullName || "Student";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const pendingForms = useMemo(() => {
    return forms.filter((f) => f.status === "active");
  }, [forms]);

  const pendingCount = pendingForms.length;
  const submittedCount = submissions.length;
  const totalFormsCount = forms.length;

  const avgRating = useMemo(() => {
    if (submissions.length === 0) return "0.0★";
    const sum = submissions.reduce((s, sub) => s + sub.rating, 0);
    return `${(sum / submissions.length).toFixed(1)}★`;
  }, [submissions]);

  const activityList = useMemo(() => {
    const act = [];
    submissions.slice(0, 3).forEach((sub, i) => {
      act.push({
        id: `sub-act-${i}`,
        icon: "check-circle",
        color: "#4ade80",
        text: `You submitted feedback for ${sub.subject}`,
        time: sub.submittedAt
      });
    });

    pendingForms.slice(0, 3).forEach((form, i) => {
      act.push({
        id: `form-act-${i}`,
        icon: "bell",
        color: "#3B82F6",
        text: `New form available: ${form.subject}`,
        time: "Active"
      });
    });

    return act.slice(0, 5);
  }, [pendingForms, submissions]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      {/* ── Welcome Banner ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.10) 50%, rgba(16,185,129,0.08) 100%)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: "var(--radius-xl)",
          padding: "1.75rem 2rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -40, right: 60, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -50, right: -20, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", fontWeight: 800, color: "#fff",
          flexShrink: 0, boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
          border: "2px solid rgba(255,255,255,0.15)",
        }}>
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: "0.2rem" }}>
            {greeting} 👋
          </p>
          <h1 style={{
            fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 800,
            color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.2,
          }}>
            Welcome back, {displayName.split(" ")[0]}!
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            You have <span style={{ color: "#fbbf24", fontWeight: 700 }}>{pendingCount} pending</span> feedback forms to complete this week.
          </p>
        </div>

        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-faint)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Semester</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>Summer 2026</span>
          <Badge variant="info" dot>Active</Badge>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={ICONS.forms}           label="Forms Available" value={totalFormsCount}    trend={20}  trendLabel="vs last semester" color="#3B82F6"  delay={0.05} />
        <StatCard icon={ICONS["check-circle"]} label="Submitted"       value={submittedCount}     trend={14}  trendLabel="completion rate"   color="#4ade80"  delay={0.1}  />
        <StatCard icon={ICONS.bell}            label="Pending"         value={pendingCount}                                               color="#fbbf24"  delay={0.15} />
        <StatCard icon={ICONS.star}            label="Avg Rating Given" value={avgRating} trend={5}   trendLabel="vs last month"    color="#f59e0b"  delay={0.2}  />
      </div>

      {/* ── Main Content Layout ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", minWidth: 0 }}>

          {/* Available Forms */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Available Feedback Forms
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  {pendingCount} forms waiting for your response
                </p>
              </div>
              <button onClick={() => navigate("/student/forms")} className="btn-ghost" style={{ height: 34, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 4 }}>
                View All <Icon d={ICONS["arrow-right"]} size={13} strokeWidth={2} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "1rem" }}>
              {pendingForms.slice(0, 4).map((form, i) => (
                <FormCard key={form.id} form={form} index={i} onAction={() => navigate("/student/forms")} />
              ))}
            </div>
          </section>

          {/* Recent Submissions */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  My Recent Submissions
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  Your latest feedback submissions
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                padding: "0.75rem 1.25rem",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-elevated)",
              }}>
                {["Form", "Subject", "Rating", "Date", "Status"].map((h) => (
                  <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </span>
                ))}
              </div>

              {submissions.slice(0, 5).map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                    padding: "0.875rem 1.25rem",
                    borderBottom: i < submissions.slice(0, 5).length - 1 ? "1px solid var(--border)" : "none",
                    alignItems: "center",
                    transition: "background 0.15s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "0.5rem" }}>
                    {sub.form}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sub.subject}</span>
                  <StarRating value={sub.rating} size={13} />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sub.submittedAt}</span>
                  <Badge variant="success" dot>Submitted</Badge>
                </motion.div>
              ))}
            </motion.div>
          </section>
        </div>

        {/* Right sidebar — Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            position: "sticky",
            top: "calc(var(--navbar-h) + 1rem)",
          }}
        >
          <div style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
              Activity Feed
            </h2>
            <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>Recent events</p>
          </div>

          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 0 }}>
            {activityList.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  paddingBottom: i < activityList.length - 1 ? "1rem" : 0,
                  marginBottom: i < activityList.length - 1 ? "1rem" : 0,
                  position: "relative",
                }}
              >
                {/* Timeline line */}
                {i < activityList.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: 10, top: 22,
                    width: 1, height: "calc(100% + 0.5rem)",
                    background: "var(--border)",
                  }} />
                )}

                {/* Dot */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${act.color}18`,
                  border: `1.5px solid ${act.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: act.color, flexShrink: 0, zIndex: 1,
                }}>
                  <Icon d={ICONS[act.icon]} size={10} strokeWidth={2.5} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {act.text}
                  </p>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-faint)", marginTop: "0.15rem", display: "block" }}>
                    {act.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
