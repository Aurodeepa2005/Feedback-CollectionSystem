import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import { LineChart } from "../../components/ui/Charts";
import { Badge } from "../../components/ui/PageHeader";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const recentColumns = [
  {
    key: "name",
    label: "Name",
    render: (v) => (
      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v}</span>
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
  { key: "joined", label: "Joined" },
];

const quickActions = [
  {
    id: "qa-forms",
    icon: ICONS.forms,
    title: "Add New Form",
    description: "Create a feedback form and publish it to students.",
    path: "/admin/forms",
    color: "#3B82F6",
  },
  {
    id: "qa-users",
    icon: ICONS.users,
    title: "Manage Users",
    description: "View, add or deactivate student and admin accounts.",
    path: "/admin/users",
    color: "#8b5cf6",
  },
  {
    id: "qa-analytics",
    icon: ICONS["bar-chart"],
    title: "View Analytics",
    description: "Explore response trends, ratings and subject insights.",
    path: "/admin/analytics",
    color: "#22d3ee",
  },
  {
    id: "qa-export",
    icon: ICONS.download,
    title: "Export Reports",
    description: "Download response data as CSV or PDF.",
    path: "/admin/analytics",
    color: "#4ade80",
  },
];

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ── Component ────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeForms: 0,
    totalResponses: 0,
    responseRate: 0,
    recentUsers: [],
    monthlyActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get("/admin/dashboard");
        setMetrics(response.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activityData = metrics.monthlyActivity;
  const recentUsers = metrics.recentUsers;

  const adminName =
    user?.name?.split(" ")[0] || user?.firstName || "Admin";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading admin panel…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      {/* ── Welcome Banner ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(59,130,246,0.18)",
          borderRadius: "var(--radius-xl)",
          padding: "1.75rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: 200,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500, marginBottom: "0.25rem" }}>
            Welcome back 👋
          </p>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Good day, {adminName}!
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
            Here's what's happening across FeedbackHub today.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "var(--bg-overlay)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "0.6rem 1rem",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 8px #4ade80",
            }}
          />
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            System Online
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard icon={ICONS.users}          label="Total Users"       value={metrics.totalUsers} color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS.forms}          label="Active Forms"      value={metrics.activeForms} color="#8b5cf6" delay={0.06} />
        <StatCard icon={ICONS.feedback}       label="Total Responses"   value={metrics.totalResponses} color="#22d3ee" delay={0.12} />
        <StatCard icon={ICONS["bar-chart"]}   label="Response Rate"     value={`${metrics.responseRate}%`} color="#4ade80" delay={0.18} />
      </div>

      {/* ── Activity Chart ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.375rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Response Activity
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
              Submission volume over the last 6 months
            </p>
          </div>
          <Badge variant="info">Jan – Jun 2026</Badge>
        </div>
        <LineChart data={activityData} height={160} />
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "0.875rem",
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1rem",
          }}
        >
          {quickActions.map((action) => (
            <motion.div
              key={action.id}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color + "44";
                e.currentTarget.style.boxShadow = `0 0 20px ${action.color}18, var(--shadow-md)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Subtle background glow */}
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${action.color}18 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--radius-sm)",
                  background: `${action.color}18`,
                  border: `1px solid ${action.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: action.color,
                  marginBottom: "0.875rem",
                }}
              >
                <Icon d={action.icon} size={17} strokeWidth={2} />
              </div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.015em",
                  marginBottom: "0.3rem",
                }}
              >
                {action.title}
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {action.description}
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  right: "1rem",
                  color: "var(--text-faint)",
                  display: "flex",
                }}
              >
                <Icon d={ICONS["arrow-right"]} size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Recent Registrations ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.375rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Recent Registrations
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
              Latest users who joined the platform
            </p>
          </div>
          <button
            className="btn-ghost"
            style={{ height: 34, fontSize: "0.78rem", padding: "0 0.875rem" }}
            onClick={() => navigate("/admin/users")}
          >
            View All
            <Icon d={ICONS["arrow-right"]} size={13} style={{ marginLeft: 4 }} />
          </button>
        </div>

        <DataTable
          columns={recentColumns}
          data={recentUsers}
          searchable={false}
          pageSize={5}
          emptyMessage="No recent registrations."
        />
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
