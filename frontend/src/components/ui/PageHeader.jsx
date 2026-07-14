import React from "react";
import { motion } from "framer-motion";
import Icon, { ICONS } from "./Icon";

/**
 * PageHeader — consistent page title, subtitle, breadcrumb, and actions area
 */
export const PageHeader = ({ title, subtitle, actions, breadcrumb, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut", delay }}
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "1rem",
      flexWrap: "wrap",
    }}
  >
    <div>
      {breadcrumb && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.75rem",
          color: "var(--text-faint)",
          marginBottom: "0.4rem",
          fontWeight: 500,
        }}>
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Icon d={ICONS.chevron} size={12} />}
              <span style={{ color: i === breadcrumb.length - 1 ? "var(--text-muted)" : "inherit" }}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>

    {actions && (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", flexShrink: 0 }}>
        {actions}
      </div>
    )}
  </motion.div>
);

/**
 * Badge — status badge with multiple variants
 */
export const Badge = ({ variant = "default", children, dot = false }) => {
  const styles = {
    default:  { bg: "rgba(255,255,255,0.07)", color: "var(--text-secondary)",   border: "rgba(255,255,255,0.1)",      dot: "#808080" },
    admin:    { bg: "rgba(99,102,241,0.15)",  color: "var(--brand-hover)",       border: "var(--brand-border)",        dot: "var(--brand)" },
    student:  { bg: "rgba(34,211,238,0.1)",   color: "var(--accent-cyan)",       border: "rgba(34,211,238,0.2)",       dot: "#22d3ee" },
    faculty:  { bg: "rgba(167,139,250,0.12)", color: "#c4b5fd",                  border: "rgba(167,139,250,0.2)",      dot: "#a78bfa" },
    success:  { bg: "rgba(34,197,94,0.1)",    color: "#4ade80",                  border: "rgba(34,197,94,0.2)",        dot: "#22c55e" },
    warning:  { bg: "rgba(245,158,11,0.1)",   color: "#fbbf24",                  border: "rgba(245,158,11,0.2)",       dot: "#f59e0b" },
    danger:   { bg: "rgba(239,68,68,0.1)",    color: "#f87171",                  border: "rgba(239,68,68,0.2)",        dot: "#ef4444" },
    info:     { bg: "rgba(59,130,246,0.1)",   color: "var(--brand-hover)",       border: "rgba(59,130,246,0.2)",       dot: "var(--brand)" },
    pending:  { bg: "rgba(250,204,21,0.08)",  color: "#fde047",                  border: "rgba(250,204,21,0.18)",      dot: "#eab308" },
    inactive: { bg: "rgba(90,90,90,0.15)",    color: "var(--text-faint)",        border: "rgba(90,90,90,0.2)",         dot: "#5a5a5a" },
  };
  const s = styles[variant] || styles.default;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
      padding: "0.15rem 0.55rem",
      borderRadius: 99,
      fontSize: "0.675rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {dot && (
        <span style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
};

/**
 * Simple card wrapper
 */
export const Card = ({ children, style, className, padding = "1.375rem", hover = false }) => (
  <div
    className={className}
    style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding,
      transition: hover ? "border-color 0.2s, box-shadow 0.2s" : undefined,
      ...style,
    }}
    onMouseEnter={hover ? (e) => {
      e.currentTarget.style.borderColor = "var(--border-hover)";
      e.currentTarget.style.boxShadow = "var(--shadow-md)";
    } : undefined}
    onMouseLeave={hover ? (e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.boxShadow = "none";
    } : undefined}
  >
    {children}
  </div>
);

/**
 * Empty state component
 */
export const EmptyState = ({ icon, title, description, action }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    gap: "1rem",
  }}>
    {icon && (
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-faint)",
        marginBottom: "0.25rem",
      }}>
        <Icon d={icon} size={22} strokeWidth={1.5} />
      </div>
    )}
    <div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem", maxWidth: 320, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
    </div>
    {action && <div style={{ marginTop: "0.5rem" }}>{action}</div>}
  </div>
);

export default PageHeader;
