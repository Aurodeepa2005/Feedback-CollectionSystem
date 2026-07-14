import React from "react";
import { motion } from "framer-motion";
import Icon from "./Icon";

/**
 * StatCard — metric / KPI card
 * Props: icon, label, value, trend, trendLabel, color, delay, onClick
 */
const StatCard = ({
  icon,
  label,
  value,
  trend,           // positive number = up, negative = down
  trendLabel,
  color = "var(--brand)",
  delay = 0,
  onClick,
}) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      onClick={onClick}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={onClick ? { scale: 1.015 } : {}}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Subtle glow */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Icon + label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${color}18`,
            border: `1px solid ${color}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            flexShrink: 0,
          }}>
            <Icon d={icon} size={15} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontSize: "clamp(1.6rem, 3vw, 2rem)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "var(--text-primary)",
        lineHeight: 1,
      }}>
        {value}
      </div>

      {/* Trend */}
      {(trend !== undefined || trendLabel) && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {trend !== undefined && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: isPositive ? "#4ade80" : isNegative ? "#f87171" : "var(--text-muted)",
            }}>
              {isPositive && "↑"}
              {isNegative && "↓"}
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && (
            <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
