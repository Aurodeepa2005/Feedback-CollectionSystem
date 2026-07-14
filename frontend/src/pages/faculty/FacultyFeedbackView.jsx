import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Badge, Card } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { StarRating } from "../../components/ui/Charts";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const FacultyFeedbackView = () => {
  const { user } = useAuth();
  const [selectedCourse,   setSelectedCourse]   = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [detailFb,         setDetailFb]         = useState(null);
  const [feedback,         setFeedback]         = useState([]);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axiosInstance.get("/faculty/feedback");
        const mapped = response.data.map(fb => ({
          id: fb.id,
          course: fb.subjectCode,
          subject: fb.subject,
          rating: fb.overallRating,
          comment: fb.comment,
          semester: "Spring 2026",
          date: fb.submittedAt,
          questions: {
            teaching: fb.teachingRating,
            content: fb.contentRating,
            pace: fb.overallRating,
            support: fb.overallRating
          }
        }));
        setFeedback(mapped);
      } catch (err) {
        console.error("Error loading feedback list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const COURSES = useMemo(() => {
    const codes = new Set(feedback.map(fb => fb.course));
    return ["All", ...Array.from(codes)];
  }, [feedback]);

  const SEMESTERS = ["All", "Spring 2026"];

  const filtered = useMemo(() =>
    feedback.filter((fb) =>
      (selectedCourse   === "All" || fb.course   === selectedCourse) &&
      (selectedSemester === "All" || fb.semester === selectedSemester)
    ),
    [feedback, selectedCourse, selectedSemester]
  );

  const avgRating = filtered.length
    ? (filtered.reduce((s, fb) => s + fb.rating, 0) / filtered.length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading feedback responses…</span>
      </div>
    );
  }

  const columns = [
    {
      key: "course",
      label: "Course",
      render: (val) => (
        <span style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--brand-hover)",
          background: "var(--brand-muted)",
          padding: "0.15rem 0.5rem",
          borderRadius: 6,
          border: "1px solid var(--brand-border)",
        }}>
          {val}
        </span>
      ),
    },
    { key: "subject", label: "Subject" },
    {
      key: "rating",
      label: "Rating",
      render: (val) => <StarRating value={val} size={13} />,
    },
    {
      key: "comment",
      label: "Comment",
      sortable: false,
      render: (val) => (
        <span style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          maxWidth: 320,
        }}>
          "{val}"
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (val) => (
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Feedback Received"
        subtitle="Anonymized student feedback for your courses."
        breadcrumb={["Faculty", "Feedback"]}
      />

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.875rem" }}>
        {[
          { label: "Total Responses",   value: filtered.length,                  color: "var(--brand)" },
          { label: "Average Rating",    value: `${avgRating} ★`,                  color: "#fbbf24" },
          { label: "5★ Responses",      value: filtered.filter(f => f.rating === 5).length, color: "#4ade80" },
          { label: "Needs Attention",   value: filtered.filter(f => f.rating <= 2).length, color: "#f87171" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "0.875rem 1rem",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, color: s.color, marginTop: "0.3rem", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Icon d={ICONS.filter} size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>Filter:</span>
        </div>
        <div style={{ position: "relative" }}>
          <select
            id="faculty-course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="field-input"
            style={{ height: 36, fontSize: "0.8rem", paddingLeft: "0.75rem", minWidth: 150, cursor: "pointer" }}
          >
            {COURSES.map((c) => <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>)}
          </select>
        </div>
        <div style={{ position: "relative" }}>
          <select
            id="faculty-semester-filter"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="field-input"
            style={{ height: 36, fontSize: "0.8rem", paddingLeft: "0.75rem", minWidth: 150, cursor: "pointer" }}
          >
            {SEMESTERS.map((s) => <option key={s} value={s}>{s === "All" ? "All Semesters" : s}</option>)}
          </select>
        </div>

        {(selectedCourse !== "All" || selectedSemester !== "All") && (
          <button
            className="btn-ghost"
            onClick={() => { setSelectedCourse("All"); setSelectedSemester("All"); }}
            style={{ height: 36, fontSize: "0.78rem" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search feedback…"
        pageSize={8}
        emptyMessage="No feedback found for the selected filters."
        actions={(row) => (
          <button
            className="btn-ghost"
            id={`view-feedback-${row.id}`}
            onClick={() => setDetailFb(row)}
            style={{ height: 30, fontSize: "0.75rem", padding: "0 0.75rem" }}
          >
            View
          </button>
        )}
      />

      {/* Detail Modal */}
      <Modal
        open={!!detailFb}
        onClose={() => setDetailFb(null)}
        title="Feedback Detail"
      >
        {detailFb && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--brand-hover)",
                background: "var(--brand-muted)",
                padding: "0.2rem 0.6rem",
                borderRadius: 6,
                border: "1px solid var(--brand-border)",
              }}>
                {detailFb.course}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {detailFb.subject}
              </span>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Teaching Quality",  val: detailFb.questions?.teaching },
                { label: "Course Content",    val: detailFb.questions?.content },
                { label: "Pace",              val: detailFb.questions?.pace },
                { label: "Student Support",   val: detailFb.questions?.support },
              ].map((q) => (
                <div key={q.label}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                    {q.label}
                  </div>
                  <StarRating value={q.val} size={16} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Overall
              </span>
              <StarRating value={detailFb.rating} size={16} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {detailFb.rating}/5
              </span>
            </div>

            <div style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "0.875rem",
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              fontStyle: "italic",
            }}>
              "{detailFb.comment}"
            </div>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>Semester</span>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>{detailFb.semester}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>Submitted</span>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  {new Date(detailFb.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.625rem 0.75rem", background: "var(--brand-muted)", border: "1px solid var(--brand-border)", borderRadius: "var(--radius-sm)" }}>
              <Icon d={ICONS.shield} size={13} style={{ color: "var(--brand-hover)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "var(--brand-hover)" }}>
                This response is fully anonymized — student identity is not disclosed.
              </span>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default FacultyFeedbackView;
