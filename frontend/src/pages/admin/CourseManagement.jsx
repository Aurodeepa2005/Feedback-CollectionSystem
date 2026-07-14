import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { PageHeader, Badge } from "../../components/ui/PageHeader";
import { FormField, Toggle } from "../../components/ui/FormField";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ── Mock Data ───────────────────────────────────────────────────── */
const DEPARTMENTS = ["All", "Computer Science", "Mathematics", "Physics", "English", "Chemistry", "Economics", "History", "Biology"];
const SEMESTERS = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester"];

const emptyForm = {
  code: "", name: "", department: "Computer Science", faculty: "",
  semester: "1st Semester", status: true,
};

/* ── Component ───────────────────────────────────────────────────── */
const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCoursesAndFaculty = async () => {
    try {
      const [coursesRes, facultyRes] = await Promise.all([
        axiosInstance.get("/admin/courses"),
        axiosInstance.get("/admin/faculty")
      ]);
      const mappedCourses = coursesRes.data.data.map(c => ({
        ...c,
        faculty: c.facultyName
      }));
      setCourses(mappedCourses);
      setFacultyList(facultyRes.data.data);
    } catch (err) {
      console.error("Failed to load courses data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndFaculty();
  }, []);

  useEffect(() => {
    if (facultyList.length > 0 && !form.faculty) {
      setForm(f => ({ ...f, faculty: facultyList[0].name }));
    }
  }, [facultyList]);

  const FACULTIES = facultyList.map(f => f.name);

  /* ── Filtered courses ── */
  const filteredCourses = useMemo(
    () =>
      deptFilter === "All"
        ? courses
        : courses.filter((c) => c.department === deptFilter),
    [courses, deptFilter]
  );

  /* ── Handlers ── */
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/admin/courses/${deleteTarget.id}`);
      setCourses((c) => c.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete course");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setForm({
      code: row.code,
      name: row.name,
      department: row.department,
      faculty: row.faculty,
      semester: row.semester,
      status: row.status === "active",
    });
    setErrors({});
    setShowModal(true);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      ...emptyForm,
      faculty: facultyList.length > 0 ? facultyList[0].name : ""
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Course code is required.";
    if (!form.name.trim()) e.name = "Course name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const statusVal = form.status ? "active" : "inactive";
    const selectedFacultyObj = facultyList.find(f => f.name === form.faculty);

    try {
      if (editTarget) {
        const response = await axiosInstance.put(`/admin/courses/${editTarget.id}`, {
          code: form.code,
          name: form.name,
          department: form.department,
          facultyId: selectedFacultyObj ? selectedFacultyObj.id : null,
          semester: form.semester,
          status: statusVal
        });
        const updatedCourse = {
          ...response.data,
          faculty: response.data.facultyName
        };
        setCourses(c => c.map(x => x.id === editTarget.id ? updatedCourse : x));
      } else {
        const response = await axiosInstance.post("/admin/courses", {
          code: form.code,
          name: form.name,
          department: form.department,
          facultyId: selectedFacultyObj ? selectedFacultyObj.id : null,
          semester: form.semester
        });
        const newCourse = {
          ...response.data,
          faculty: response.data.facultyName
        };
        setCourses(c => [newCourse, ...c]);
      }
      setShowModal(false);
      setEditTarget(null);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save course");
    }
  };

  const handleFormChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ── Columns ── */
  const columns = [
    {
      key: "code",
      label: "Code",
      render: (v) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "var(--brand-hover)",
            background: "var(--brand-muted)",
            padding: "0.15rem 0.5rem",
            borderRadius: 6,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      key: "name",
      label: "Course Name",
      render: (v) => (
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v}</span>
      ),
    },
    { key: "department", label: "Department" },
    { key: "faculty",    label: "Faculty" },
    { key: "semester",   label: "Semester" },
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

  const activeCourses = courses.filter((c) => c.status === "active").length;
  const totalDepts = [...new Set(courses.map((c) => c.department))].length;
  const totalSemesters = [...new Set(courses.map((c) => c.semester))].length;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading course registry…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Course Management"
        subtitle="Create and manage courses, assign faculty, and track by semester."
        actions={
          <button className="btn-primary" onClick={openAdd}>
            <Icon d={ICONS.plus} size={15} />
            Add Course
          </button>
        }
      />

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          margin: "1.5rem 0",
        }}
      >
        <StatCard icon={ICONS.book}         label="Total Courses"  value={courses.length}  color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS["check-circle"]} label="Active"      value={activeCourses}   color="#4ade80" delay={0.06} />
        <StatCard icon={ICONS.grid}         label="Departments"    value={totalDepts}       color="#8b5cf6" delay={0.12} />
        <StatCard icon={ICONS.calendar}     label="Semesters"      value={totalSemesters}   color="#22d3ee" delay={0.18} />
      </div>

      {/* ── Department Filter ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Filter by department:
        </span>
        <div style={{ position: "relative" }}>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="field-input"
            style={{ height: 36, fontSize: "0.82rem", paddingRight: "2rem", minWidth: 200 }}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {deptFilter !== "All" && (
          <button
            className="btn-ghost"
            style={{ height: 36, fontSize: "0.78rem", padding: "0 0.75rem" }}
            onClick={() => setDeptFilter("All")}
          >
            <Icon d={ICONS.close} size={12} />
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={filteredCourses}
        searchable
        searchPlaceholder="Search by code, name or faculty…"
        pageSize={10}
        actions={actions}
        emptyMessage="No courses found for this filter."
      />

      {/* ── Delete Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.code} – ${deleteTarget.name}"? All associated feedback forms will be unlinked.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditTarget(null);
          setForm(emptyForm);
          setErrors({});
        }}
        title={editTarget ? "Edit Course" : "Add New Course"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
            <FormField
              id="course-code"
              label="Course Code"
              placeholder="e.g. CS301"
              value={form.code}
              onChange={handleFormChange("code")}
              error={errors.code}
              required
              index={0}
            />
            <FormField
              id="course-name"
              label="Course Name"
              placeholder="e.g. Data Structures"
              value={form.name}
              onChange={handleFormChange("name")}
              error={errors.name}
              required
              index={1}
            />
          </div>
          <FormField
            id="course-dept"
            label="Department"
            as="select"
            value={form.department}
            onChange={handleFormChange("department")}
            index={2}
          >
            {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </FormField>
          <FormField
            id="course-faculty"
            label="Faculty"
            as="select"
            value={form.faculty}
            onChange={handleFormChange("faculty")}
            index={3}
          >
            {FACULTIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </FormField>
          <FormField
            id="course-semester"
            label="Semester"
            as="select"
            value={form.semester}
            onChange={handleFormChange("semester")}
            index={4}
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FormField>

          {/* Status Toggle */}
          <div style={{ marginTop: "0.5rem" }}>
            <Toggle
              id="course-status-toggle"
              label="Course Active"
              description="Active courses will be visible to students and can receive feedback."
              checked={form.status}
              onChange={(val) => setForm((f) => ({ ...f, status: val }))}
            />
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
                setShowModal(false);
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
              {editTarget ? "Save Changes" : "Add Course"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CourseManagement;
