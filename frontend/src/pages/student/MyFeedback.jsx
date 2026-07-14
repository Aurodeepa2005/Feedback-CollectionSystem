import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Badge } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import { StarRating } from "../../components/ui/Charts";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

/* ─── Animation preset ───────────────────────────────────────────────────────── */
const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ─── Mock data ──────────────────────────────────────────────────────────────── */
const SUBMISSIONS = [
  {
    id: "sub1",
    form: "End-of-Semester Feedback",
    subject: "Operating Systems",
    code: "CS401",
    faculty: "Dr. Kevin Park",
    dept: "Computer Science",
    rating: 5,
    date: "Jul 8, 2026",
    dateISO: "2026-07-08",
    status: "submitted",
    answers: {
      q1: 5,
      q2: 5,
      q3: 4,
      q4: "Yes",
      q5: "Dr. Park's explanations of memory management were exceptional. The labs were very hands-on and helped solidify concepts.",
    },
  },
  {
    id: "sub2",
    form: "Teaching Quality Review",
    subject: "Linear Algebra",
    code: "MA301",
    faculty: "Prof. Amelia Torres",
    dept: "Mathematics",
    rating: 4,
    date: "Jul 5, 2026",
    dateISO: "2026-07-05",
    status: "submitted",
    answers: {
      q1: 4,
      q2: 4,
      q3: 4,
      q4: "Yes",
      q5: "Great explanations of eigenvalues. Would appreciate more practice problems in class.",
    },
  },
  {
    id: "sub3",
    form: "Semester Wrap-Up Survey",
    subject: "Thermodynamics",
    code: "PH201",
    faculty: "Dr. Rajan Mehta",
    dept: "Physics",
    rating: 3,
    date: "Jun 30, 2026",
    dateISO: "2026-06-30",
    status: "submitted",
    answers: {
      q1: 3,
      q2: 3,
      q3: 3,
      q4: "No",
      q5: "The course content was heavy. More visual aids and simulations would help understand complex thermodynamic concepts.",
    },
  },
  {
    id: "sub4",
    form: "Faculty Evaluation Form",
    subject: "English Literature",
    code: "EN101",
    faculty: "Ms. Lisa Thornton",
    dept: "English",
    rating: 5,
    date: "Jun 27, 2026",
    dateISO: "2026-06-27",
    status: "submitted",
    answers: {
      q1: 5,
      q2: 5,
      q3: 5,
      q4: "Yes",
      q5: "Ms. Thornton makes literature come alive! Her passion for the subject is truly contagious.",
    },
  },
  {
    id: "sub5",
    form: "Mid-Term Evaluation",
    subject: "Web Development",
    code: "CS210",
    faculty: "Ms. Laura Chen",
    dept: "Computer Science",
    rating: 4,
    date: "Jun 20, 2026",
    dateISO: "2026-06-20",
    status: "submitted",
    answers: {
      q1: 4,
      q2: 5,
      q3: 4,
      q4: "Yes",
      q5: "The project-based learning approach is fantastic. Really enjoy the hands-on React sessions.",
    },
  },
  {
    id: "sub6",
    form: "Course Experience Survey",
    subject: "Discrete Mathematics",
    code: "MA205",
    faculty: "Prof. Daniel Russo",
    dept: "Mathematics",
    rating: 3,
    date: "Jun 15, 2026",
    dateISO: "2026-06-15",
    status: "submitted",
    answers: {
      q1: 3,
      q2: 4,
      q3: 3,
      q4: "Yes",
      q5: "Could use more real-world examples to illustrate graph theory applications.",
    },
  },
  {
    id: "sub7",
    form: "End-of-Semester Feedback",
    subject: "Computer Networks",
    code: "CS350",
    faculty: "Dr. Ahmed Hassan",
    dept: "Computer Science",
    rating: 5,
    date: "Jun 8, 2026",
    dateISO: "2026-06-08",
    status: "submitted",
    answers: {
      q1: 5,
      q2: 5,
      q3: 5,
      q4: "Yes",
      q5: "Outstanding course! The packet tracer labs really helped understand networking concepts in depth.",
    },
  },
  {
    id: "sub8",
    form: "Faculty Feedback Form",
    subject: "Database Systems",
    code: "CS320",
    faculty: "Dr. Nadia Volkov",
    dept: "Computer Science",
    rating: 4,
    date: "May 30, 2026",
    dateISO: "2026-05-30",
    status: "submitted",
    answers: {
      q1: 4,
      q2: 4,
      q3: 5,
      q4: "Yes",
      q5: "Excellent SQL labs. Dr. Volkov is very approachable and always willing to help after class.",
    },
  },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const SATISFACTION_LABELS = ["", "Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"];

// Dynamic calculations moved inside component

/* ─── Details Modal ──────────────────────────────────────────────────────────── */
function DetailsModal({ submission, open, onClose }) {
  if (!submission) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="det-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 8888 }}
          />
          <motion.div
            key="det-panel"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 8889,
              width: "min(540px, calc(100vw - 2rem))",
              maxHeight: "85vh", overflowY: "auto",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "1.5rem 1.75rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              position: "sticky", top: 0,
              background: "var(--bg-elevated)", zIndex: 1,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{
                      padding: "0.12rem 0.5rem", borderRadius: 99,
                      fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      background: "rgba(59,130,246,0.12)", color: "var(--brand)",
                      border: "1px solid rgba(59,130,246,0.25)",
                    }}>{submission.code}</span>
                    <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{submission.dept}</span>
                  </div>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    {submission.form}
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    {submission.subject} · {submission.faculty}
                  </p>
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", borderRadius: 6, flexShrink: 0 }}>
                  <Icon d={ICONS.close} size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Submission meta */}
              <div style={{
                display: "flex", gap: "1rem",
                padding: "0.875rem 1rem",
                background: "var(--bg-overlay)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: "0.25rem" }}>Submitted</p>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{submission.date}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: "0.25rem" }}>Overall Rating</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <StarRating value={submission.rating} size={16} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24" }}>{submission.rating}/5</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: "0.25rem" }}>Status</p>
                  <Badge variant="success" dot>Submitted</Badge>
                </div>
              </div>

              {/* Q1 */}
              <AnswerRow
                num={1}
                question="Overall course rating"
                type="rating"
                value={submission.answers.q1}
                label={RATING_LABELS[submission.answers.q1]}
              />

              {/* Q2 */}
              <AnswerRow
                num={2}
                question="Teaching quality rating"
                type="rating"
                value={submission.answers.q2}
                label={RATING_LABELS[submission.answers.q2]}
              />

              {/* Q3 */}
              <AnswerRow
                num={3}
                question="Course content satisfaction"
                type="rating"
                value={submission.answers.q3}
                label={SATISFACTION_LABELS[submission.answers.q3]}
              />

              {/* Q4 */}
              <AnswerRow
                num={4}
                question="Would recommend this course?"
                type="yesno"
                value={submission.answers.q4}
              />

              {/* Q5 */}
              <AnswerRow
                num={5}
                question="Additional comments"
                type="text"
                value={submission.answers.q5}
              />

              {/* Anonymous notice */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "0.75rem 1rem",
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
                borderRadius: "var(--radius-sm)",
              }}>
                <Icon d={ICONS.shield} size={14} strokeWidth={2} style={{ color: "var(--brand)", flexShrink: 0 }} />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  This feedback was submitted <strong style={{ color: "var(--brand)" }}>anonymously</strong>. Your identity is never shared with the faculty.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AnswerRow({ num, question, type, value, label }) {
  return (
    <div style={{
      padding: "1rem 1.125rem",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
    }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        Q{num}. {question}
      </p>
      {type === "rating" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <StarRating value={value} size={18} />
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
        </div>
      ) : type === "yesno" ? (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "0.25rem 0.75rem",
          borderRadius: 99,
          background: value === "Yes" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          color: value === "Yes" ? "#4ade80" : "#f87171",
          border: `1px solid ${value === "Yes" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
          fontWeight: 700, fontSize: "0.82rem",
        }}>
          <Icon d={value === "Yes" ? ICONS.check : ICONS.close} size={13} strokeWidth={2.5} />
          {value}
        </span>
      ) : (
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
          {value || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>No comment provided</span>}
        </p>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function MyFeedback() {
  const { user } = useAuth();
  const [selectedSub, setSelectedSub] = useState(null);
  const [detailsOpen, setDetailsOpen]  = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosInstance.get("/student/my-feedback");
        setSubmissions(response.data);
      } catch (err) {
        console.error("Failed to fetch my submissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const avgRating = submissions.length > 0
    ? (submissions.reduce((s, f) => s + f.rating, 0) / submissions.length).toFixed(1)
    : "0.0";
  const thisSemester = submissions.length > 0
    ? submissions.filter((s) => s.dateISO >= "2026-06-01").length
    : 0;

  const columns = [
    {
      key: "form",
      label: "Form / Subject",
      render: (_v, row) => (
        <div>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.15rem" }}>{row.form}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              padding: "0.08rem 0.4rem", borderRadius: 99,
              fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              background: "rgba(59,130,246,0.1)", color: "var(--brand)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}>{row.code}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{row.subject}</span>
          </div>
        </div>
      ),
    },
    {
      key: "faculty",
      label: "Faculty",
      render: (_v, row) => (
        <div>
          <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>{row.faculty}</p>
          <p style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>{row.dept}</p>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (v) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <StarRating value={v} size={14} />
          <span style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{v}/5</span>
        </div>
      ),
    },
    {
      key: "submittedAt",
      label: "Submitted",
      render: (v) => (
        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{v}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => <Badge variant="success" dot>Submitted</Badge>,
    },
  ];

  const actions = (row) => (
    <button
      className="btn-ghost"
      style={{ height: 30, fontSize: "0.75rem", padding: "0 0.75rem", display: "inline-flex", alignItems: "center", gap: 4 }}
      onClick={() => {
        setSelectedSub(row);
        setDetailsOpen(true);
      }}
    >
      <Icon d={ICONS.eye} size={13} />
      View Details
    </button>
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading feedback history…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="My Feedback"
        subtitle="Your submitted feedback history — all responses are anonymous"
        breadcrumb={["Student", "My Feedback"]}
        actions={
          <button className="btn-ghost" style={{ height: 38, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={ICONS.download} size={14} strokeWidth={2} />
            Export
          </button>
        }
      />

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", margin: "1.75rem 0" }}>
        <StatCard
          icon={ICONS["check-circle"]}
          label="Total Submitted"
          value={submissions.length}
          trend={12}
          trendLabel="vs last semester"
          color="#4ade80"
          delay={0.05}
        />
        <StatCard
          icon={ICONS.star}
          label="Average Rating"
          value={`${avgRating}★`}
          trend={8}
          trendLabel="improvement"
          color="#f59e0b"
          delay={0.1}
        />
        <StatCard
          icon={ICONS.calendar}
          label="This Semester"
          value={thisSemester}
          trendLabel="of 12 forms"
          color="#3B82F6"
          delay={0.15}
        />
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <DataTable
          columns={columns}
          data={submissions}
          searchable
          pageSize={6}
          actions={actions}
          emptyMessage="No feedback submitted yet."
        />
      </motion.div>

      {/* ── Details Modal ──────────────────────────────────────────────────── */}
      <DetailsModal
        submission={selectedSub}
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedSub(null); }}
      />
    </motion.div>
  );
}
