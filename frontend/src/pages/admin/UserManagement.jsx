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

const emptyForm = { name: "", email: "", role: "student", password: "", confirmPassword: "" };

/* ── Component ───────────────────────────────────────────────────── */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/admin/users?limit=100");
      setUsers(response.data.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/admin/users/${deleteTarget.id}`);
      setUsers((u) => u.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${row.id}/toggle`);
      setUsers((u) =>
        u.map((x) =>
          x.id === row.id
            ? { ...x, status: response.data.status }
            : x
        )
      );
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    try {
      const response = await axiosInstance.post("/admin/users", {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password
      });
      setUsers((u) => [response.data, ...u]);
      setShowAddModal(false);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create user");
    }
  };

  const handleFormChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ── Table columns ─────────────────────────────────────────────── */
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (v) => (
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{v}</span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (v) => (
        <Badge variant={v === "admin" ? "admin" : "student"} dot>
          {v}
        </Badge>
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
    {
      key: "joined",
      label: "Joined",
      render: (v) =>
        new Date(v).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  const actions = (row) => (
    <>
      <button
        className="btn-ghost"
        style={{ height: 30, fontSize: "0.75rem", padding: "0 0.75rem" }}
        onClick={() => handleToggleStatus(row)}
        title={row.status === "active" ? "Deactivate" : "Activate"}
      >
        <Icon d={row.status === "active" ? ICONS["x-circle"] : ICONS["check-circle"]} size={13} />
        {row.status === "active" ? "Deactivate" : "Activate"}
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading user accounts…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      {/* ── Header ── */}
      <PageHeader
        title="User Management"
        subtitle="Manage student and admin accounts across the platform."
        actions={
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Icon d={ICONS.plus} size={15} />
            Add User
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          margin: "1.5rem 0",
        }}
      >
        <StatCard icon={ICONS.users}         label="Total Users"   value={users.length} color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS["check-circle"]} label="Active Users" value={users.filter(u => u.status === "active").length} color="#4ade80" delay={0.06} />
        <StatCard icon={ICONS.shield}        label="Admins"        value={users.filter(u => u.role === "admin").length}    color="#8b5cf6" delay={0.12} />
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={users}
        searchable
        searchPlaceholder="Search by name or email…"
        pageSize={10}
        actions={actions}
        emptyMessage="No users found."
      />

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* ── Add User Modal ── */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setForm(emptyForm);
          setErrors({});
        }}
        title="Add New User"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <FormField
            id="add-user-name"
            label="Full Name"
            placeholder="e.g. Jane Smith"
            value={form.name}
            onChange={handleFormChange("name")}
            error={errors.name}
            required
            index={0}
          />
          <FormField
            id="add-user-email"
            label="Email Address"
            type="email"
            placeholder="user@university.edu"
            value={form.email}
            onChange={handleFormChange("email")}
            error={errors.email}
            required
            index={1}
          />
          <FormField
            id="add-user-role"
            label="Role"
            as="select"
            value={form.role}
            onChange={handleFormChange("role")}
            index={2}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </FormField>
          <FormField
            id="add-user-password"
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleFormChange("password")}
            error={errors.password}
            required
            index={3}
          />
          <FormField
            id="add-user-confirm"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleFormChange("confirmPassword")}
            error={errors.confirmPassword}
            required
            index={4}
          />
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
                setForm(emptyForm);
                setErrors({});
              }}
              style={{ height: 38, fontSize: "0.82rem" }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleAddUser}
              style={{ height: 38, fontSize: "0.82rem" }}
            >
              <Icon d={ICONS.plus} size={14} />
              Create User
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default UserManagement;
