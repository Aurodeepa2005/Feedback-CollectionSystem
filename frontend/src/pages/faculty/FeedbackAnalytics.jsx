import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card } from "../../components/ui/PageHeader";
import { BarChart, LineChart, DonutChart, ProgressBar, StarRating } from "../../components/ui/Charts";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const FeedbackAnalytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("year");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({ courses: [] });
  const [analytics, setAnalytics] = useState({
    avgRating: 0.0,
    totalResponses: 0,
    responseRate: 0,
    monthlyTrend: [],
    criteriaBreakdown: { teaching: 0, content: 0, clarity: 0, engagement: 0 }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashRes, anaRes] = await Promise.all([
          axiosInstance.get("/faculty/dashboard"),
          axiosInstance.get("/faculty/analytics")
        ]);
        setDashboard(dashRes.data);
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error("Error loading analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const SUBJECT_DATA = dashboard.courses.map((c, i) => {
    const colors = ["#3B82F6", "#8b5cf6", "#22d3ee", "#f59e0b", "#10B981", "#EC4899"];
    return {
      label: c.code,
      value: c.responseCount,
      color: colors[i % colors.length]
    };
  });

  const TREND_DATA = analytics.monthlyTrend;

  const COURSE_BREAKDOWN = dashboard.courses.map(c => ({
    code: c.code,
    name: c.name,
    avgRating: c.avgRating,
    responses: c.responseCount,
    satisfaction: c.responseRate,
    improvement: "Excellent overall feedback"
  }));

  const RATING_CRITERIA = [
    { label: "Teaching Methodology", avg: analytics.criteriaBreakdown.teaching },
    { label: "Course Content Quality", avg: analytics.criteriaBreakdown.content },
    { label: "Student Support", avg: analytics.criteriaBreakdown.engagement },
    { label: "Pacing & Delivery", avg: analytics.criteriaBreakdown.clarity },
    { label: "Assessment Fairness", avg: analytics.criteriaBreakdown.teaching },
  ];

  const totalResponses  = analytics.totalResponses;
  const overallAvg      = Number(analytics.avgRating).toFixed(1);
  const overallSatisf   = analytics.responseRate;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading analytics…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Feedback Analytics"
        subtitle="In-depth analysis of your course ratings and student satisfaction."
        breadcrumb={["Faculty", "Analytics"]}
        actions={
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {["month", "semester", "year"].map((p) => (
              <button
                key={p}
                id={`period-${p}-btn`}
                onClick={() => setPeriod(p)}
                style={{
                  height: 32,
                  padding: "0 0.875rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid",
                  borderColor: period === p ? "var(--border-brand)" : "var(--border)",
                  background: period === p ? "var(--brand-muted)" : "transparent",
                  color: period === p ? "var(--brand-hover)" : "var(--text-muted)",
                  fontSize: "0.75rem",
                  fontWeight: period === p ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Responses",   value: totalResponses, color: "#3B82F6", icon: ICONS.feedback, trend: 18 },
          { label: "Overall Avg Rating",value: `${overallAvg}★`,    color: "#fbbf24", icon: ICONS.star,     trend: 3  },
          { label: "Satisfaction Rate", value: `${overallSatisf}%`,  color: "#4ade80", icon: ICONS.activity, trend: 7  },
          { label: "Courses Analyzed",  value: COURSE_BREAKDOWN.length, color: "#a78bfa", icon: ICONS.book,  trend: 0  },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.125rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: -30, right: -30, width: 90, height: 90,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${kpi.color}18 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {kpi.label}
              </span>
              <div style={{ color: kpi.color, opacity: 0.8 }}>
                <Icon d={kpi.icon} size={14} strokeWidth={2} />
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
              {kpi.value}
            </div>
            {kpi.trend > 0 && (
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "#4ade80", marginTop: "0.25rem" }}>
                ↑ {kpi.trend}% vs last period
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Card>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
              Responses by Course
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              Total feedback submissions per course
            </p>
          </div>
          <BarChart data={SUBJECT_DATA} height={180} />
        </Card>

        <Card>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
              Rating by Criteria
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              Average scores across evaluation dimensions
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {RATING_CRITERIA.map((c) => (
              <ProgressBar
                key={c.label}
                value={c.avg}
                max={5}
                label={c.label}
                color={c.avg >= 4.5 ? "#4ade80" : c.avg >= 4.0 ? "#60a5fa" : "#fbbf24"}
                showPct={false}
                height={7}
              />
            ))}
          </div>
          <div style={{ marginTop: "0.875rem", padding: "0.625rem 0.75rem", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Scale: 1 (Poor) — 5 (Excellent)
          </div>
        </Card>
      </div>

      {/* Monthly trend line chart */}
      <Card>
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
              Response Trend
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              Monthly feedback submissions across all courses
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Responses</span>
          </div>
        </div>
        <LineChart data={TREND_DATA} height={160} />
      </Card>

      {/* Course breakdown */}
      <div>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.875rem", letterSpacing: "-0.015em" }}>
          Per-Course Breakdown
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {COURSE_BREAKDOWN.map((course, i) => (
            <motion.div
              key={course.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.125rem",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--brand-hover)",
                      background: "var(--brand-muted)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 5,
                      border: "1px solid var(--brand-border)",
                    }}>
                      {course.code}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.25rem" }}>
                    {course.name}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StarRating value={course.avgRating} size={14} />
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                    {course.avgRating}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <ProgressBar
                  value={course.satisfaction}
                  max={100}
                  label="Satisfaction"
                  color={course.satisfaction >= 90 ? "#4ade80" : course.satisfaction >= 75 ? "#60a5fa" : "#fbbf24"}
                  height={6}
                />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.625rem",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}>
                  <Icon d={ICONS.feedback} size={12} />
                  Top suggestion: <em style={{ color: "var(--text-secondary)" }}>{course.improvement}</em>
                </div>

                <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                  {course.responses} total responses
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackAnalytics;
