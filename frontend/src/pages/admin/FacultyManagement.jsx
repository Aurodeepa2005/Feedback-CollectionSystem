import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { PageHeader, Badge } from "../../components/ui/PageHeader";
import { FormField } from "../../components/ui/FormField";
import { StarRating } from "../../components/ui/Charts";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ── Mock Data ───────────────────────────────────────────────────── */
const DEPARTMENTS = ["All", "Computer Science", "Mathematics", "Physics", "English", "Chemistry", "Economics", "History", "Biology"];

const emptyForm = { name: "", email: "", password: "", department: "Computer Science", status: "active" };

/* ── Component ───────────────────────────────────────────────────── */
const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFaculty = async () => {
    try {
      const response = await axiosInstance.get("/admin/faculty");
      setFaculty(response.data.data);
    } catch (err) {
      console.error("Failed to load faculty", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  /* ── Handlers ── */
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/admin/users/${deleteTarget.id}`);
      setFaculty((f) => f.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete faculty member");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setForm({ name: row.name, email: row.email || "", password: "", department: row.department, status: row.status });
    setShowAddModal(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required.";
    if (!editTarget && form.password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (editTarget) {
        await axiosInstance.put(`/admin/users/${editTarget.id}`, {
          name: form.name,
          email: form.email,
          department: form.department,
          status: form.status
        });
        fetchFaculty();
      } else {
        await axiosInstance.post("/admin/users", {
          name: form.name,
          email: form.email,
          role: "faculty",
          password: form.password,
          department: form.department,
          status: form.status
        });
        fetchFaculty();
      }
      setShowAddModal(false);
      setEditTarget(null);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save faculty");
    }
  };

  const handleFormChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ── Columns ── */
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (v) => (
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{v}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (v) => (
        <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{v}</span>
      ),
    },
    {
      key: "courses",
      label: "Courses",
      render: (v) => (
        <span
          style={{
            background: "var(--brand-muted)",
            color: "var(--brand-hover)",
            borderRadius: 99,
            padding: "0.15rem 0.6rem",
            fontSize: "0.72rem",
            fontWeight: 700,
          }}
        >
          {v} courses
        </span>
      ),
    },
    {
      key: "rating",
      label: "Avg Rating",
      render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <StarRating value={v} size={13} />
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {v.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <Badge variant={v === "active" ? "success" : "inactive"} dot>
          {v}
        </Badge>
      ),
    },
  ];

  const actions = (row) => (
    <>
      <button
        className="btn-ghost"
        style={{ height: 30, fontSize: "0.75rem", padding: "0 0.75rem" }}
        onClick={() => openEdit(row)}
      >
        <Icon d={ICONS.edit} size={13} />
        Edit
      </button>
      <button
        className="btn-danger"
        style={{ height: 30, fontSize: "0.75rem", padding: "0 0.75rem" }}
        onClick={() => setDeleteTarget(row)}
      >
        <Icon d={ICONS.trash} size={13} />
        Delete
      </button>
    </>
  );

  const activeFaculty = faculty.filter((f) => f.status === "active").length;
  const depts = [...new Set(faculty.map((f) => f.department))].length;
  const avgRating = faculty.length > 0 ? (faculty.reduce((s, f) => s + f.rating, 0) / faculty.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading faculty profiles…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Faculty Management"
        subtitle="Manage faculty members, departments and course assignments."
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setEditTarget(null);
              setForm(emptyForm);
              setErrors({});
              setShowAddModal(true);
            }}
          >
            <Icon d={ICONS.plus} size={15} />
            Add Faculty
          </button>
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
        <StatCard icon={ICONS.users}   label="Total Faculty"  value={faculty.length} color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS["check-circle"]} label="Active"  value={activeFaculty}  color="#4ade80" delay={0.06} />
        <StatCard icon={ICONS.grid}    label="Departments"   value={depts}           color="#8b5cf6" delay={0.12} />
        <StatCard icon={ICONS.star}    label="Avg Rating"    value={`${avgRating}★`} color="#fbbf24" delay={0.18} />
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={faculty}
        searchable
        searchPlaceholder="Search faculty by name or department…"
        pageSize={10}
        actions={actions}
        emptyMessage="No faculty members found."
      />

      {/* ── Delete Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Faculty Member"
        message={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.name}" from the system? This will also unlink their courses.`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditTarget(null);
          setForm(emptyForm);
          setErrors({});
        }}
        title={editTarget ? "Edit Faculty Member" : "Add Faculty Member"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <FormField
            id="faculty-name"
            label="Full Name"
            placeholder="e.g. Dr. John Smith"
            value={form.name}
            onChange={handleFormChange("name")}
            error={errors.name}
            required
            index={0}
          />
          <FormField
            id="faculty-email"
            label="Email Address"
            type="email"
            placeholder="e.g. professor@university.edu"
            value={form.email}
            onChange={handleFormChange("email")}
            error={errors.email}
            required
            index={1}
          />
          {!editTarget && (
            <FormField
              id="faculty-password"
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleFormChange("password")}
              error={errors.password}
              required
              index={2}
            />
          )}
          <FormField
            id="faculty-dept"
            label="Department"
            as="select"
            value={form.department}
            onChange={handleFormChange("department")}
            error={errors.department}
            index={3}
          >
            {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </FormField>
          <FormField
            id="faculty-status"
            label="Status"
            as="select"
            value={form.status}
            onChange={handleFormChange("status")}
            index={4}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FormField>

          <div
            style={{
              display: "flex",
              gap: "0.625rem",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <button
              className="btn-ghost"
              onClick={() => {
                setShowAddModal(false);
                setEditTarget(null);
                setForm(emptyForm);
                setErrors({});
              }}
              style={{ height: 38, fontSize: "0.82rem" }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              style={{ height: 38, fontSize: "0.82rem" }}
            >
              <Icon d={ICONS.check} size={14} />
              {editTarget ? "Save Changes" : "Add Faculty"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default FacultyManagement;
