import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { PageHeader, Badge, Card } from "../../components/ui/PageHeader";
import { StarRating } from "../../components/ui/Charts";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ── Component ───────────────────────────────────────────────────── */
const ResponsesPage = () => {
  const [selectedForm, setSelectedForm] = useState("All Forms");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [minRating, setMinRating]       = useState(0);
  const [detailRow, setDetailRow]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [responses, setResponses]       = useState([]);
  const [formOptions, setFormOptions]   = useState(["All Forms"]);

  useEffect(() => {
    const fetchResponsesData = async () => {
      try {
        const [respRes, formsRes] = await Promise.all([
          axiosInstance.get("/admin/responses?limit=200"),
          axiosInstance.get("/admin/forms")
        ]);
        
        const mapped = respRes.data.data.map(r => ({
          id: r.id,
          studentId: `Student #${String(r.id).slice(-4)}`,
          form: r.formTitle,
          subject: r.subject,
          rating: r.overallRating,
          submitted: r.submittedAt.slice(0, 10),
          status: "reviewed",
          answers: [
            { q: "Overall Course Rating", a: `${r.overallRating}★` },
            { q: "Teaching Quality Rating", a: `${r.teachingRating}★` },
            { q: "Course Content Quality", a: `${r.contentRating}★` },
            { q: "Recommendation", a: r.recommendation ? "Recommended this course." : "Did not recommend this course." },
            { q: "Written Student Comments", a: r.comment || "No comments written." }
          ]
        }));
        
        setResponses(mapped);
        
        const titles = ["All Forms", ...formsRes.data.data.map(f => f.title)];
        setFormOptions([...new Set(titles)]);
      } catch (err) {
        console.error("Failed to load feedback responses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResponsesData();
  }, []);

  /* ── Filtered data ── */
  const filtered = responses.filter((r) => {
    if (selectedForm !== "All Forms" && r.form !== selectedForm) return false;
    if (startDate && r.submitted < startDate) return false;
    if (endDate   && r.submitted > endDate)   return false;
    if (minRating > 0 && r.rating < minRating) return false;
    return true;
  });

  const avgRating = filtered.length
    ? (filtered.reduce((s, r) => s + r.rating, 0) / filtered.length).toFixed(1)
    : "—";

  /* ── Columns ── */
  const statusVariant = {
    reviewed: "success",
    pending:  "warning",
    flagged:  "danger",
  };

  const columns = [
    {
      key: "studentId",
      label: "Student",
      render: (v) => (
        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>{v}</span>
      ),
    },
    {
      key: "form",
      label: "Form Title",
      render: (v) => (
        <span
          style={{
            maxWidth: 200,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={v}
        >
          {v}
        </span>
      ),
    },
    { key: "subject", label: "Subject" },
    {
      key: "rating",
      label: "Rating",
      render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <StarRating value={v} size={12} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {v.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      key: "submitted",
      label: "Submitted",
      render: (v) =>
        new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <Badge variant={statusVariant[v] || "default"} dot>
          {v}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading feedback responses…</span>
      </div>
    );
  }

  const thisMonthCount = responses.filter(r => {
    const d = new Date(r.submitted);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Feedback Responses"
        subtitle="Browse and review all submitted student feedback across forms and subjects."
        actions={
          <>
            <button className="btn-ghost" style={{ height: 36, fontSize: "0.8rem" }}>
              <Icon d={ICONS.filter} size={14} />
              Filter
            </button>
            <button className="btn-ghost" style={{ height: 36, fontSize: "0.8rem" }}>
              <Icon d={ICONS.download} size={14} />
              Export
            </button>
          </>
        }
      />

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          margin: "1.5rem 0",
        }}
      >
        <StatCard icon={ICONS.feedback}  label="Total Responses" value={responses.length} color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS.calendar}  label="This Month"      value={thisMonthCount} color="#22d3ee" delay={0.06} />
        <StatCard icon={ICONS.star}      label="Average Rating"  value={avgRating === "—" ? "—" : `${avgRating}★`}  color="#fbbf24" delay={0.12} />
      </div>

      {/* ── Filter Bar ── */}
      <Card padding="1rem" style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "flex-end",
          }}
        >
          {/* Form Select */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", minWidth: 200 }}>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Form
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="field-input"
              style={{ height: 36, fontSize: "0.82rem" }}
            >
              {formOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="field-input"
              style={{ height: 36, fontSize: "0.82rem" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="field-input"
              style={{ height: 36, fontSize: "0.82rem" }}
            />
          </div>

          {/* Min Rating */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Min Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="field-input"
              style={{ height: 36, fontSize: "0.82rem" }}
            >
              <option value={0}>Any Rating</option>
              <option value={1}>1★ & above</option>
              <option value={2}>2★ & above</option>
              <option value={3}>3★ & above</option>
              <option value={4}>4★ & above</option>
              <option value={5}>5★ only</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedForm !== "All Forms" || startDate || endDate || minRating > 0) && (
            <button
              className="btn-ghost"
              style={{ height: 36, fontSize: "0.78rem", alignSelf: "flex-end" }}
              onClick={() => {
                setSelectedForm("All Forms");
                setStartDate("");
                setEndDate("");
                setMinRating(0);
              }}
            >
              <Icon d={ICONS.close} size={13} />
              Clear Filters
            </button>
          )}

          {/* Result count */}
          <div style={{ marginLeft: "auto", alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> results
            </span>
            {filtered.length > 0 && (
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Avg: <strong style={{ color: "#fbbf24" }}>{avgRating}★</strong>
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={filtered}
        searchable
        searchPlaceholder="Search by student ID, form or subject…"
        pageSize={10}
        emptyMessage="No responses match your filters."
        onRowClick={(row) => setDetailRow(row)}
      />

      {/* ── Detail Modal ── */}
      <Modal
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        title="Response Detail"
      >
        {detailRow && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Meta info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                background: "var(--bg-overlay)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
              }}
            >
              {[
                { label: "Student ID",  value: detailRow.studentId },
                { label: "Form",        value: detailRow.form },
                { label: "Subject",     value: detailRow.subject },
                { label: "Submitted",   value: new Date(detailRow.submitted).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 3 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>{value}</p>
                </div>
              ))}
              <div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 3 }}>
                  Rating
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <StarRating value={detailRow.rating} size={14} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24" }}>
                    {detailRow.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 3 }}>
                  Status
                </p>
                <Badge variant={statusVariant[detailRow.status] || "default"} dot>
                  {detailRow.status}
                </Badge>
              </div>
            </div>

            {/* Answers */}
            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.625rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Responses
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {detailRow.answers.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--bg-overlay)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.875rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--brand-hover)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Q{i + 1}. {item.q}
                    </p>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.65,
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ResponsesPage;
