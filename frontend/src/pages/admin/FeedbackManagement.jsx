import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { PageHeader, Badge } from "../../components/ui/PageHeader";
import { FormField } from "../../components/ui/FormField";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ── Mock Data ───────────────────────────────────────────────────── */
const emptyForm = {
  title: "",
  subject: "",
  description: "",
  deadline: "",
  questions: 5,
};

const statusVariant = { active: "success", draft: "warning", archived: "inactive" };

/* ── Component ───────────────────────────────────────────────────── */
const FeedbackManagement = () => {
  const [forms, setForms] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFormsData = async () => {
    try {
      const [formsRes, coursesRes] = await Promise.all([
        axiosInstance.get("/admin/forms"),
        axiosInstance.get("/admin/courses")
      ]);
      const mapped = formsRes.data.data.map(f => ({
        ...f,
        responses: f.responsesCount,
        created: f.deadline // fallback to deadline or custom date
      }));
      setForms(mapped);
      setCoursesList(coursesRes.data.data);
    } catch (err) {
      console.error("Failed to load forms data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormsData();
  }, []);

  useEffect(() => {
    if (coursesList.length > 0 && !form.subject) {
      setForm(f => ({ ...f, subject: coursesList[0].name }));
    }
  }, [coursesList]);

  const SUBJECTS = coursesList.map(c => c.name);

  /* ── Handlers ── */
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/admin/forms/${deleteTarget.id}`);
      setForms((f) => f.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete form");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTogglePublish = async (row) => {
    try {
      const response = await axiosInstance.patch(`/admin/forms/${row.id}/publish`);
      setForms((f) =>
        f.map((x) =>
          x.id === row.id
            ? { ...x, status: response.data.status }
            : x
        )
      );
    } catch (err) {
      alert("Failed to toggle publish status");
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Form title is required.";
    if (!form.deadline) e.deadline = "Deadline date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      const selectedCourseObj = coursesList.find(c => c.name === form.subject);
      const response = await axiosInstance.post("/admin/forms", {
        title: form.title,
        courseId: selectedCourseObj ? selectedCourseObj.id : null,
        deadline: form.deadline
      });
      // Map responsesCount to responses
      const newForm = {
        ...response.data,
        responses: response.data.responsesCount || 0
      };
      setForms((f) => [newForm, ...f]);
      setShowCreateModal(false);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create form");
    }
  };

  const handleFormChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ── Stats ── */
  const activeForms   = forms.filter((f) => f.status === "active").length;
  const draftForms    = forms.filter((f) => f.status === "draft").length;
  const archivedForms = forms.filter((f) => f.status === "archived").length;
  const totalResponses = forms.reduce((s, f) => s + f.responses, 0);

  /* ── Columns ── */
  const columns = [
    {
      key: "title",
      label: "Form Title",
      render: (v) => (
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{v}</span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (v) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{v}</span>
      ),
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
    {
      key: "responses",
      label: "Responses",
      render: (v) => (
        <span style={{ fontWeight: 600, color: v > 0 ? "var(--text-primary)" : "var(--text-faint)" }}>
          {v.toLocaleString()}
        </span>
      ),
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (v) =>
        new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      key: "created",
      label: "Created",
      render: (v) =>
        new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
  ];

  const actions = (row) => (
    <>
      <button
        className="btn-ghost"
        style={{ height: 30, fontSize: "0.73rem", padding: "0 0.6rem" }}
        onClick={() => handleTogglePublish(row)}
        title={row.status === "active" ? "Unpublish" : "Publish"}
        disabled={row.status === "archived"}
      >
        <Icon d={row.status === "active" ? ICONS["eye-off"] : ICONS.eye} size={13} />
        {row.status === "active" ? "Unpublish" : "Publish"}
      </button>
      <button
        className="btn-danger"
        style={{ height: 30, fontSize: "0.73rem", padding: "0 0.6rem" }}
        onClick={() => setDeleteTarget(row)}
      >
        <Icon d={ICONS.trash} size={13} />
        Delete
      </button>
    </>
  );

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
        title="Feedback Management"
        subtitle="Create, publish and manage feedback forms for courses and faculty."
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setForm(emptyForm);
              setErrors({});
              setShowCreateModal(true);
            }}
          >
            <Icon d={ICONS.plus} size={15} />
            Create New Form
          </button>
        }
      />

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          margin: "1.5rem 0",
        }}
      >
        <StatCard icon={ICONS.forms}           label="Total Forms"      value={forms.length}     color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS["check-circle"]} label="Active"           value={activeForms}      color="#4ade80" delay={0.06} />
        <StatCard icon={ICONS.edit}            label="Draft"            value={draftForms}       color="#fbbf24" delay={0.12} />
        <StatCard icon={ICONS.layers}          label="Archived"         value={archivedForms}    color="#808080" delay={0.18} />
        <StatCard icon={ICONS.feedback}        label="Total Responses"  value={totalResponses.toLocaleString()} color="#22d3ee" delay={0.24} />
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={forms}
        searchable
        searchPlaceholder="Search forms by title or subject…"
        pageSize={10}
        actions={actions}
        emptyMessage="No feedback forms found."
      />

      {/* ── Delete Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Feedback Form"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? All ${deleteTarget.responses} responses will be permanently lost.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* ── Create Form Modal ── */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setForm(emptyForm);
          setErrors({});
        }}
        title="Create New Feedback Form"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <FormField
            id="ff-title"
            label="Form Title"
            placeholder="e.g. Mid-Semester Course Evaluation"
            value={form.title}
            onChange={handleFormChange("title")}
            error={errors.title}
            required
            index={0}
          />
          <FormField
            id="ff-subject"
            label="Subject"
            as="select"
            value={form.subject}
            onChange={handleFormChange("subject")}
            index={1}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FormField>
          <FormField
            id="ff-description"
            label="Description"
            as="textarea"
            placeholder="Brief description of the form's purpose…"
            value={form.description}
            onChange={handleFormChange("description")}
            rows={3}
            index={2}
          />
          <FormField
            id="ff-deadline"
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={handleFormChange("deadline")}
            error={errors.deadline}
            required
            index={3}
          />

          {/* Questions slider */}
          <div className="field-group" style={{ marginTop: "0.25rem" }}>
            <label className="field-label">
              Number of Questions
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 700,
                  color: "var(--brand-hover)",
                  background: "var(--brand-muted)",
                  padding: "0.1rem 0.5rem",
                  borderRadius: 99,
                  fontSize: "0.78rem",
                }}
              >
                {form.questions}
              </span>
            </label>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={form.questions}
              onChange={(e) => setForm((f) => ({ ...f, questions: Number(e.target.value) }))}
              style={{
                width: "100%",
                accentColor: "var(--brand)",
                cursor: "pointer",
                height: 4,
                marginTop: "0.5rem",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                color: "var(--text-faint)",
                marginTop: "0.25rem",
              }}
            >
              <span>3 min</span>
              <span>15 max</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.625rem",
              justifyContent: "flex-end",
              marginTop: "0.75rem",
            }}
          >
            <button
              className="btn-ghost"
              onClick={() => {
                setShowCreateModal(false);
                setForm(emptyForm);
                setErrors({});
              }}
              style={{ height: 38, fontSize: "0.82rem" }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleCreate}
              style={{ height: 38, fontSize: "0.82rem" }}
            >
              <Icon d={ICONS.plus} size={14} />
              Create Form
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default FeedbackManagement;
