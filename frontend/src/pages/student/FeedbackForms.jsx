import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Badge } from "../../components/ui/PageHeader";
import { StarRating } from "../../components/ui/Charts";
import Modal from "../../components/ui/Modal";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

/* ─── Animation preset ───────────────────────────────────────────────────────── */
const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ─── Mock forms data ────────────────────────────────────────────────────────── */
const INITIAL_FORMS = [
  { id: "f1",  code: "CS301", subject: "Data Structures & Algorithms", faculty: "Dr. Sarah Mitchell",  dept: "Computer Science", title: "End-of-Semester Feedback",     deadline: "2026-07-13", status: "active",     color: "#3B82F6", questionsTotal: 5, questionsAnswered: 2 },
  { id: "f2",  code: "MA201", subject: "Calculus II",                  faculty: "Prof. James Nguyen",  dept: "Mathematics",      title: "Mid-Term Evaluation",          deadline: "2026-07-18", status: "active",     color: "#8B5CF6", questionsTotal: 5, questionsAnswered: 0 },
  { id: "f3",  code: "PH101", subject: "Quantum Mechanics",            faculty: "Dr. Elena Kozlov",    dept: "Physics",          title: "Course Experience Survey",     deadline: "2026-07-20", status: "active",     color: "#06B6D4", questionsTotal: 5, questionsAnswered: 0 },
  { id: "f4",  code: "EN202", subject: "Technical Writing",            faculty: "Ms. Patricia Wells",  dept: "English",          title: "Faculty Feedback Form",        deadline: "2026-07-25", status: "active",     color: "#10B981", questionsTotal: 5, questionsAnswered: 0 },
  { id: "f5",  code: "CS401", subject: "Operating Systems",            faculty: "Dr. Kevin Park",      dept: "Computer Science", title: "End-of-Semester Feedback",     deadline: "2026-07-08", status: "completed",  color: "#3B82F6", questionsTotal: 5, questionsAnswered: 5 },
  { id: "f6",  code: "MA301", subject: "Linear Algebra",               faculty: "Prof. Amelia Torres", dept: "Mathematics",      title: "Teaching Quality Review",      deadline: "2026-07-05", status: "completed",  color: "#8B5CF6", questionsTotal: 5, questionsAnswered: 5 },
  { id: "f7",  code: "PH201", subject: "Thermodynamics",               faculty: "Dr. Rajan Mehta",     dept: "Physics",          title: "Semester Wrap-Up Survey",      deadline: "2026-06-30", status: "expired",    color: "#06B6D4", questionsTotal: 5, questionsAnswered: 0 },
  { id: "f8",  code: "CS210", subject: "Web Development",              faculty: "Ms. Laura Chen",      dept: "Computer Science", title: "Faculty Evaluation Form",      deadline: "2026-06-25", status: "expired",    color: "#F59E0B", questionsTotal: 5, questionsAnswered: 0 },
];

const TABS = ["All", "Active", "Completed", "Expired"];

const STATUS_MAP = {
  active:    { variant: "info",     label: "Active" },
  completed: { variant: "success",  label: "Completed" },
  expired:   { variant: "inactive", label: "Expired" },
};

/* ─── Deadline badge ─────────────────────────────────────────────────────────── */
function DeadlineBadge({ deadline, status }) {
  if (status !== "active") return null;
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  let color, bg;
  if (days < 3)      { color = "#f87171"; bg = "rgba(239,68,68,0.12)"; }
  else if (days < 7) { color = "#fbbf24"; bg = "rgba(245,158,11,0.12)"; }
  else               { color = "#4ade80"; bg = "rgba(34,197,94,0.1)"; }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "0.2rem 0.55rem", borderRadius: 99,
      fontSize: "0.67rem", fontWeight: 700, color, background: bg,
      border: `1px solid ${color}30`,
    }}>
      <Icon d={ICONS.calendar} size={10} strokeWidth={2} />
      {days < 0 ? "Expired" : `${days}d left`}
    </span>
  );
}

/* ─── Feedback Form Modal ────────────────────────────────────────────────────── */
function FeedbackModal({ form, open, onClose, onSubmit }) {
  const [answers, setAnswers] = useState({ q1: 0, q2: 0, q3: 0, q4: null, q5: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!answers.q1) e.q1 = true;
    if (!answers.q2) e.q2 = true;
    if (!answers.q3) e.q3 = true;
    if (answers.q4 === null) e.q4 = true;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await axiosInstance.post(`/student/forms/${form.id}/submit`, { answers });
      setAnswers({ q1: 0, q2: 0, q3: 0, q4: null, q5: "" });
      setErrors({});
      onSubmit(form.id);
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="fb-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 8888 }}
          />

          {/* Centering wrapper — keeps translate(-50%,-50%) separate from Framer Motion transforms */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 8889,
              width: "min(560px, calc(100vw - 2rem))",
            }}
          >
          <motion.div
            key="fb-panel"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              maxHeight: "85vh",
              overflowY: "auto",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: "1.5rem 1.75rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              position: "sticky", top: 0,
              background: "var(--bg-elevated)",
              zIndex: 1,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{
                      padding: "0.15rem 0.55rem", borderRadius: 99,
                      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                      background: `${form.color}18`, color: form.color, border: `1px solid ${form.color}30`,
                    }}>{form.code}</span>
                    <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{form.dept}</span>
                  </div>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    {form.title}
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    {form.subject} · {form.faculty}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 4, display: "flex",
                    borderRadius: 6, flexShrink: 0,
                  }}
                >
                  <Icon d={ICONS.close} size={18} />
                </button>
              </div>
            </div>

            {/* Questions */}
            <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Q1: Overall rating */}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
                  1. Overall, how would you rate this course? <span style={{ color: "#f87171" }}>*</span>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <StarRating value={answers.q1} interactive onChange={(v) => { setAnswers((a) => ({ ...a, q1: v })); setErrors((e) => ({ ...e, q1: false })); }} size={28} />
                  {answers.q1 > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][answers.q1]}
                    </span>
                  )}
                </div>
                {errors.q1 && <p style={{ fontSize: "0.73rem", color: "#f87171", marginTop: "0.3rem" }}>Please provide a rating</p>}
              </div>

              {/* Q2: Teaching quality */}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
                  2. How would you rate the teaching quality? <span style={{ color: "#f87171" }}>*</span>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <StarRating value={answers.q2} interactive onChange={(v) => { setAnswers((a) => ({ ...a, q2: v })); setErrors((e) => ({ ...e, q2: false })); }} size={28} />
                  {answers.q2 > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][answers.q2]}
                    </span>
                  )}
                </div>
                {errors.q2 && <p style={{ fontSize: "0.73rem", color: "#f87171", marginTop: "0.3rem" }}>Please provide a rating</p>}
              </div>

              {/* Q3: Course content */}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
                  3. How satisfied are you with the course content? <span style={{ color: "#f87171" }}>*</span>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <StarRating value={answers.q3} interactive onChange={(v) => { setAnswers((a) => ({ ...a, q3: v })); setErrors((e) => ({ ...e, q3: false })); }} size={28} />
                  {answers.q3 > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {["", "Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"][answers.q3]}
                    </span>
                  )}
                </div>
                {errors.q3 && <p style={{ fontSize: "0.73rem", color: "#f87171", marginTop: "0.3rem" }}>Please provide a rating</p>}
              </div>

              {/* Q4: Recommendation */}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
                  4. Would you recommend this course to other students? <span style={{ color: "#f87171" }}>*</span>
                </p>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setAnswers((a) => ({ ...a, q4: opt })); setErrors((e) => ({ ...e, q4: false })); }}
                      style={{
                        height: 40, padding: "0 1.25rem",
                        borderRadius: "var(--radius-sm)",
                        border: answers.q4 === opt
                          ? `1.5px solid ${opt === "Yes" ? "#4ade80" : "#f87171"}`
                          : "1px solid var(--border)",
                        background: answers.q4 === opt
                          ? opt === "Yes" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)"
                          : "var(--bg-overlay)",
                        color: answers.q4 === opt
                          ? opt === "Yes" ? "#4ade80" : "#f87171"
                          : "var(--text-secondary)",
                        fontWeight: 600, fontSize: "0.82rem",
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {answers.q4 === opt && <Icon d={ICONS.check} size={14} strokeWidth={2.5} />}
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.q4 && <p style={{ fontSize: "0.73rem", color: "#f87171", marginTop: "0.3rem" }}>Please select an option</p>}
              </div>

              {/* Q5: Comments */}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
                  5. Any additional comments or suggestions?
                </p>
                <textarea
                  value={answers.q5}
                  onChange={(e) => setAnswers((a) => ({ ...a, q5: e.target.value }))}
                  placeholder="Share your thoughts, suggestions, or any specific feedback..."
                  rows={4}
                  className="field-input"
                  style={{ resize: "vertical", padding: "0.75rem 0.9rem", height: "auto" }}
                />
              </div>

            {/* Submit */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                <button className="btn-ghost" onClick={onClose} disabled={loading} style={{ height: 40, fontSize: "0.82rem" }}>
                  Cancel
                </button>
                <motion.button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  style={{
                    height: 40, padding: "0 1.5rem", fontSize: "0.85rem",
                    display: "flex", alignItems: "center", gap: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Icon d={ICONS["check-circle"]} size={15} strokeWidth={2} />
                      Submit Feedback
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Toast notification ─────────────────────────────────────────────────────── */
function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed", bottom: "2rem", right: "2rem",
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem 1.25rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
            color: "#4ade80", fontWeight: 600, fontSize: "0.85rem",
            zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(34,197,94,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon d={ICONS["check-circle"]} size={16} strokeWidth={2} />
          </div>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Form Card ──────────────────────────────────────────────────────────────── */
function FormCard({ form, index, onStart }) {
  const isActive    = form.status === "active";
  const isCompleted = form.status === "completed";
  const isExpired   = form.status === "expired";
  const { variant, label } = STATUS_MAP[form.status];

  const days = Math.ceil((new Date(form.deadline) - new Date()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 + index * 0.06 }}
      style={{
        background: isCompleted
          ? "linear-gradient(135deg, rgba(34,197,94,0.04) 0%, var(--bg-surface) 100%)"
          : "var(--bg-surface)",
        border: isActive
          ? `1px solid ${form.color}35`
          : "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.2s, border-color 0.2s",
        boxShadow: isActive ? `0 0 0 1px ${form.color}15, inset 0 0 0 1px ${form.color}08` : "none",
      }}
      onMouseEnter={(e) => {
        if (!isExpired) {
          e.currentTarget.style.boxShadow = isActive
            ? `0 0 20px ${form.color}20, var(--shadow-md)`
            : "var(--shadow-md)";
          e.currentTarget.style.borderColor = isActive ? `${form.color}55` : "var(--border-hover)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isActive ? `0 0 0 1px ${form.color}15` : "none";
        e.currentTarget.style.borderColor = isActive ? `${form.color}35` : "var(--border)";
      }}
    >
      {/* Glow accent */}
      {isActive && (
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${form.color}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Completed overlay shimmer */}
      {isCompleted && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(34,197,94,0.03) 0%, transparent 60%)",
          pointerEvents: "none", borderRadius: "inherit",
        }} />
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: isExpired ? "var(--bg-overlay)" : `${form.color}18`,
          border: `1px solid ${isExpired ? "var(--border)" : form.color + "28"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isExpired ? "var(--text-faint)" : form.color,
          flexShrink: 0,
        }}>
          <Icon d={ICONS.forms} size={17} strokeWidth={1.75} />
        </div>
        <Badge variant={variant} dot>{label}</Badge>
      </div>

      {/* Course info */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
          <span style={{
            padding: "0.12rem 0.45rem", borderRadius: 99,
            fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            background: isExpired ? "var(--bg-overlay)" : `${form.color}18`,
            color: isExpired ? "var(--text-faint)" : form.color,
            border: `1px solid ${isExpired ? "var(--border)" : form.color + "28"}`,
          }}>
            {form.code}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{form.dept}</span>
        </div>
        <h3 style={{
          fontSize: "0.88rem", fontWeight: 700,
          color: isExpired ? "var(--text-muted)" : "var(--text-primary)",
          letterSpacing: "-0.015em", lineHeight: 1.35,
          marginBottom: "0.2rem",
        }}>
          {form.title}
        </h3>
        <p style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>
          {form.subject}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.1rem" }}>
          {form.faculty}
        </p>
      </div>

      {/* Deadline row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <Icon d={ICONS.calendar} size={12} strokeWidth={2} style={{ color: "var(--text-faint)" }} />
        <span style={{ fontSize: "0.73rem", color: "var(--text-faint)" }}>
          {isExpired ? "Expired" : isCompleted ? "Submitted" : `Due: ${new Date(form.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
        </span>
        {isActive && <DeadlineBadge deadline={form.deadline} status={form.status} />}
      </div>

      {/* Progress indicator */}
      <div>
        {isCompleted ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "var(--radius-sm)",
          }}>
            <Icon d={ICONS["check-circle"]} size={15} strokeWidth={2} style={{ color: "#4ade80", flexShrink: 0 }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4ade80" }}>Feedback submitted successfully</span>
          </div>
        ) : isExpired ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            background: "var(--bg-overlay)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}>
            <Icon d={ICONS["x-circle"]} size={15} strokeWidth={2} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-faint)" }}>Submission period has ended</span>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            background: `${form.color}08`,
            border: `1px solid ${form.color}20`,
            borderRadius: "var(--radius-sm)",
          }}>
            <Icon d={ICONS.forms} size={14} strokeWidth={2} style={{ color: form.color, flexShrink: 0 }} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              {form.questionsAnswered > 0
                ? `${form.questionsAnswered}/${form.questionsTotal} questions answered`
                : `${form.questionsTotal} questions`}
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <motion.button
        onClick={isActive ? () => onStart(form) : undefined}
        disabled={!isActive}
        whileHover={isActive ? { scale: 1.02 } : {}}
        whileTap={isActive ? { scale: 0.97 } : {}}
        style={{
          width: "100%",
          height: 40,
          borderRadius: "var(--radius-sm)",
          border: isActive ? `1px solid ${form.color}40` : "1px solid var(--border)",
          background: isActive ? `${form.color}18` : "var(--bg-overlay)",
          color: isActive ? form.color : "var(--text-faint)",
          fontWeight: 600, fontSize: "0.82rem",
          cursor: isActive ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "background 0.15s, border-color 0.15s",
          marginTop: "auto",
        }}
        onMouseEnter={(e) => { if (isActive) e.currentTarget.style.background = `${form.color}28`; }}
        onMouseLeave={(e) => { if (isActive) e.currentTarget.style.background = `${form.color}18`; }}
      >
        {isCompleted && <Icon d={ICONS.check} size={14} strokeWidth={2.5} />}
        {isExpired ? "Unavailable" : isCompleted ? "Already Submitted" : "Start Feedback"}
        {isActive && <Icon d={ICONS["arrow-right"]} size={13} strokeWidth={2.5} />}
      </motion.button>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function FeedbackForms() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]   = useState("All");
  const [forms, setForms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [toast, setToast]           = useState({ visible: false, message: "" });

  const fetchForms = async () => {
    try {
      const response = await axiosInstance.get("/student/forms");
      setForms(response.data);
    } catch (err) {
      console.error("Error fetching forms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const filtered = activeTab === "All"
    ? forms
    : forms.filter((f) => f.status === activeTab.toLowerCase());

  const counts = {
    All:       forms.length,
    Active:    forms.filter((f) => f.status === "active").length,
    Completed: forms.filter((f) => f.status === "completed").length,
    Expired:   forms.filter((f) => f.status === "expired").length,
  };

  const handleStart = (form) => {
    setSelectedForm(form);
    setModalOpen(true);
  };

  const handleSubmit = (formId) => {
    setModalOpen(false);
    setSelectedForm(null);
    setToast({ visible: true, message: "Feedback submitted successfully! 🎉" });
    fetchForms();
    setTimeout(() => setToast({ visible: false, message: "" }), 3500);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading feedback forms…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Submit Feedback"
        subtitle="Select a form below to share your feedback with your faculty"
        breadcrumb={["Student", "Feedback Forms"]}
      />

      {/* ── Filter Tabs ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          display: "flex", alignItems: "center", gap: "0.375rem",
          padding: "0.3rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          width: "fit-content",
          marginTop: "1.5rem",
          marginBottom: "1.75rem",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              height: 36, padding: "0 1rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === tab ? "var(--brand)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--text-muted)",
              fontWeight: 600, fontSize: "0.82rem",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.18s",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: activeTab === tab ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
            }}
          >
            {tab}
            <span style={{
              padding: "0.05rem 0.45rem",
              borderRadius: 99,
              fontSize: "0.65rem", fontWeight: 700,
              background: activeTab === tab ? "rgba(255,255,255,0.2)" : "var(--bg-overlay)",
              color: activeTab === tab ? "#fff" : "var(--text-faint)",
              minWidth: 20, textAlign: "center",
            }}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── Forms Grid ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.125rem",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              gridColumn: "1 / -1",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "4rem 2rem",
              color: "var(--text-faint)", gap: "1rem",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon d={ICONS.forms} size={24} strokeWidth={1.5} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)" }}>No {activeTab.toLowerCase()} forms</p>
                <p style={{ fontSize: "0.78rem", marginTop: "0.3rem" }}>Check back later for new feedback opportunities.</p>
              </div>
            </div>
          ) : (
            filtered.map((form, i) => (
              <FormCard key={form.id} form={form} index={i} onStart={handleStart} />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Feedback Modal ─────────────────────────────────────────────────── */}
      <FeedbackModal
        form={selectedForm}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedForm(null); }}
        onSubmit={handleSubmit}
      />

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <Toast message={toast.message} visible={toast.visible} />
    </motion.div>
  );
}
