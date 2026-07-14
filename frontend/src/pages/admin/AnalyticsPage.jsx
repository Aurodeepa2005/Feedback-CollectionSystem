import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import { PageHeader, Badge, Card } from "../../components/ui/PageHeader";
import { BarChart, DonutChart, LineChart, StarRating } from "../../components/ui/Charts";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const topColumns = [
  {
    key: "code",
    label: "Code",
    render: (v) => (
      <span style={{ fontWeight: 700, color: "var(--brand-hover)", fontFamily: "monospace" }}>{v}</span>
    ),
  },
  {
    key: "name",
    label: "Subject",
    render: (v) => (
      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v}</span>
    ),
  },
  {
    key: "avgRating",
    label: "Avg Rating",
    render: (v) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <StarRating value={v} size={13} />
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {Number(v).toFixed(1)}
        </span>
      </div>
    ),
  },
  {
    key: "responses",
    label: "Responses",
    render: (v) => (
      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
        {Number(v).toLocaleString()}
      </span>
    ),
  },
];

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ── Component ───────────────────────────────────────────────────── */
const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalUsers: 0,
    activeForms: 0,
    totalResponses: 0,
    responseRate: 0,
    recentUsers: []
  });
  const [analytics, setAnalytics] = useState({
    subjectBreakdown: [],
    roleDistribution: [],
    monthlyTrend: [],
    topRatedSubjects: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [dashRes, anaRes] = await Promise.all([
          axiosInstance.get("/admin/dashboard"),
          axiosInstance.get("/admin/analytics")
        ]);
        setDashboardMetrics(dashRes.data);
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const totalResponses  = dashboardMetrics.totalResponses;
  const responseRate    = dashboardMetrics.responseRate;
  const totalUsers      = dashboardMetrics.totalUsers;

  const subjectResponseData = analytics.subjectBreakdown.map((item, index) => {
    const colors = ["#3B82F6", "#8b5cf6", "#22d3ee", "#4ade80", "#fbbf24", "#f87171"];
    return {
      label: item.label,
      value: item.value,
      color: colors[index % colors.length]
    };
  });

  const roleDistribution = analytics.roleDistribution.map((item, index) => {
    const colors = ["#3B82F6", "#8b5cf6", "#22d3ee"];
    return {
      label: item.label,
      value: item.value,
      color: colors[index % colors.length]
    };
  });

  const monthlyTrend = analytics.monthlyTrend;
  const topSubjects  = analytics.topRatedSubjects;

  const avgRating = topSubjects.length > 0
    ? (topSubjects.reduce((sum, item) => sum + item.avgRating, 0) / topSubjects.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading analytics metrics…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Analytics & Reports"
        subtitle="System-wide insights into feedback submissions, ratings and engagement."
        actions={
          <>
            <button className="btn-ghost" style={{ height: 36, fontSize: "0.8rem" }}>
              <Icon d={ICONS.download} size={14} />
              Export PDF
            </button>
            <button className="btn-ghost" style={{ height: 36, fontSize: "0.8rem" }}>
              <Icon d={ICONS.download} size={14} />
              Export CSV
            </button>
          </>
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
        <StatCard icon={ICONS.feedback}       label="Total Responses" value={totalResponses} color="#3B82F6" delay={0}    />
        <StatCard icon={ICONS.star}           label="Avg Rating"      value={`${avgRating}★`} color="#fbbf24" delay={0.06} />
        <StatCard icon={ICONS.percent}        label="Response Rate"   value={`${responseRate}%`} color="#4ade80" delay={0.12} />
        <StatCard icon={ICONS.users}          label="Total Users"     value={totalUsers} color="#8b5cf6" delay={0.18} />
      </div>

      {/* ── Two-column charts ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Bar Chart */}
        <Card padding="1.375rem">
          <div style={{ marginBottom: "1.125rem" }}>
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Responses by Subject
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 3 }}>
              Top 6 courses by submission count
            </p>
          </div>
          <BarChart data={subjectResponseData} height={200} />
        </Card>

        {/* Donut Chart */}
        <Card padding="1.375rem">
          <div style={{ marginBottom: "1.125rem" }}>
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              User Role Distribution
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 3 }}>
              Breakdown of platform users by role
            </p>
          </div>
          <DonutChart
            segments={roleDistribution}
            size={160}
            label="1,247"
            sublabel="Total Users"
          />
        </Card>
      </div>

      {/* ── Monthly Trend ── */}
      <Card padding="1.375rem" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.125rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Monthly Response Trend
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 3 }}>
              12-month submission volume — Jul 2025 to Jun 2026
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#3B82F6",
                boxShadow: "0 0 6px rgba(59,130,246,0.6)",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Responses
            </span>
          </div>
        </div>
        <LineChart data={monthlyTrend} height={180} />
      </Card>

      {/* ── Top Rated Subjects ── */}
      <Card padding="1.375rem">
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Top Rated Subjects
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 3 }}>
            Ranked by average student rating across all feedback forms
          </p>
        </div>
        <DataTable
          columns={topColumns}
          data={topSubjects}
          searchable={false}
          pageSize={10}
          emptyMessage="No subjects found."
        />
      </Card>
    </motion.div>
  );
};

export default AnalyticsPage;
