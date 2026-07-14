import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import { PageHeader, Badge, Card, EmptyState } from "../../components/ui/PageHeader";
import { BarChart, DonutChart, ProgressBar, StarRating } from "../../components/ui/Charts";
import Icon, { ICONS } from "../../components/ui/Icon";
import axiosInstance from "../../api/axiosInstance";

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const name      = user?.name || "Professor";

  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    avgRating: 0.0,
    activeForms: 0,
    courses: []
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, feedbackRes, analyticsRes] = await Promise.all([
          axiosInstance.get("/faculty/dashboard"),
          axiosInstance.get("/faculty/feedback"),
          axiosInstance.get("/faculty/analytics")
        ]);

        const mappedCourses = dashboardRes.data.courses.map(c => ({
          ...c,
          responses: c.responseCount
        }));

        setStats({
          ...dashboardRes.data,
          courses: mappedCourses
        });

        const mappedFeedback = feedbackRes.data.slice(0, 4).map(fb => {
          let dateStr = "Recent";
          if (fb.submittedAt) {
            const date = new Date(fb.submittedAt);
            const diffMs = new Date() - date;
            const diffHrs = Math.floor(diffMs / 3600000);
            if (diffHrs < 1) {
              const diffMins = Math.floor(diffMs / 60000);
              dateStr = diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
            } else if (diffHrs < 24) {
              dateStr = `${diffHrs} hours ago`;
            } else {
              const diffDays = Math.floor(diffHrs / 24);
              dateStr = diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
            }
          }

          return {
            id: fb.id,
            course: fb.subjectCode,
            student: `Student #${fb.id.slice(-4)}`,
            rating: fb.overallRating,
            comment: fb.comment,
            date: dateStr
          };
        });
        setRecentFeedback(mappedFeedback);
        setMonthlyData(analyticsRes.data.monthlyTrend);
      } catch (err) {
        console.error("Error loading faculty dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COURSES = stats.courses;
  const RECENT_FEEDBACK = recentFeedback;
  const MONTHLY_DATA = monthlyData;

  const totalStudents  = COURSES.reduce((s, c) => s + c.students, 0);
  const totalResponses = stats.totalResponses;
  const avgRating      = stats.avgRating ? Number(stats.avgRating).toFixed(1) : "0.0";
  const overallRate    = totalStudents > 0 ? Math.round((totalResponses / totalStudents) * 100) : 100;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ marginRight: "0.75rem" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      {/* Header */}
      <PageHeader
        title={`Welcome, ${name}`}
        subtitle="Here's an overview of your courses and feedback this semester."
        breadcrumb={["Faculty", "Dashboard"]}
        actions={
          <motion.button
            className="btn-primary"
            onClick={() => navigate("/faculty/analytics")}
            id="faculty-view-analytics-btn"
            style={{ height: 38, fontSize: "0.82rem" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon d={ICONS["bar-chart"]} size={14} strokeWidth={2} />
            Full Analytics
          </motion.button>
        }
      />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <StatCard icon={ICONS.book}          label="Courses Teaching"    value={COURSES.length}   delay={0}    color="#3B82F6" />
        <StatCard icon={ICONS.users}         label="Total Students"      value={totalStudents}    delay={0.06} color="#8b5cf6" trend={5}  trendLabel="vs last sem" />
        <StatCard icon={ICONS.feedback}      label="Feedback Received"   value={totalResponses}   delay={0.12} color="#22d3ee" trend={18} trendLabel="this month" />
        <StatCard icon={ICONS.star}          label="Avg Rating"          value={`${avgRating}★`}  delay={0.18} color="#fbbf24" trend={3}  trendLabel="vs last sem" />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }}>

        {/* Left: courses */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>

          {/* Course cards */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "1rem 1.375rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
                  My Courses
                </h2>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                  Feedback summary by subject
                </p>
              </div>
              <button
                className="btn-ghost"
                onClick={() => navigate("/faculty/feedback")}
                style={{ height: 32, fontSize: "0.75rem" }}
              >
                View All
              </button>
            </div>

            <div style={{ padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {COURSES.map((course, i) => (
                <motion.div
                  key={course.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => navigate("/faculty/feedback")}
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-overlay)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--brand-hover)",
                          background: "var(--brand-muted)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: 6,
                          border: "1px solid var(--brand-border)",
                        }}>
                          {course.code}
                        </span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {course.name}
                        </span>
                      </div>
                      <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {course.students} students enrolled
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <span style={{ fontSize: "1rem" }}>★</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {course.avgRating}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: course.trend > 0 ? "#4ade80" : "#f87171",
                      }}>
                        {course.trend > 0 ? "↑" : "↓"} {Math.abs(course.trend)}%
                      </span>
                    </div>
                  </div>

                  <ProgressBar
                    value={course.responses}
                    max={course.students}
                    color={course.responseRate >= 80 ? "#4ade80" : course.responseRate >= 60 ? "#fbbf24" : "#f87171"}
                    label={`${course.responses} responses`}
                    showPct={true}
                    height={5}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Monthly chart */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
                  Response Trend
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                  Feedback submissions over last 6 months
                </p>
              </div>
            </div>
            <BarChart
              data={MONTHLY_DATA.map((d) => ({ ...d, color: "#3B82F6" }))}
              height={160}
            />
          </Card>
        </div>

        {/* Right: recent feedback + distribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Rating distribution donut */}
          <Card>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: "-0.015em" }}>
              Rating Distribution
            </h3>
            <DonutChart
              size={120}
              strokeWidth={18}
              label={avgRating}
              sublabel="avg rating"
              segments={[
                { label: "Excellent (5★)", value: 58, color: "#4ade80" },
                { label: "Good (4★)", value: 28, color: "#60a5fa" },
                { label: "Average (3★)", value: 10, color: "#fbbf24" },
                { label: "Below avg (1-2★)", value: 4, color: "#f87171" },
              ]}
            />
          </Card>

          {/* Recent feedback feed */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            flex: 1,
          }}>
            <div style={{ padding: "1rem 1.125rem", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
                Recent Feedback
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                Anonymized student responses
              </p>
            </div>
            <div style={{ padding: "0.625rem" }}>
              {RECENT_FEEDBACK.map((fb, i) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  style={{
                    padding: "0.875rem",
                    borderRadius: "var(--radius-md)",
                    marginBottom: i < RECENT_FEEDBACK.length - 1 ? "0.375rem" : 0,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "var(--brand-hover)",
                        background: "var(--brand-muted)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: 4,
                        border: "1px solid var(--brand-border)",
                        fontFamily: "ui-monospace, monospace",
                      }}>
                        {fb.course}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{fb.student}</span>
                    </div>
                    <StarRating value={fb.rating} size={11} />
                  </div>
                  <p style={{
                    fontSize: "0.77rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                  }}>
                    "{fb.comment}"
                  </p>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", marginTop: "0.375rem" }}>
                    {fb.date}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          .faculty-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default FacultyDashboard;
