import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* ─── Utility ─────────────────────────────────────────────────────────────────── */
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ─── Bar Chart ──────────────────────────────────────────────────────────────── */
/**
 * BarChart
 * data: [{ label, value, color? }]
 * height: chart height (default 180)
 */
export const BarChart = ({ data = [], height = 180, animated = true, showValues = true }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.5rem",
        height,
        padding: "0 0.25rem",
        minWidth: data.length * 50,
      }}>
        {data.map((item, i) => {
          const pct = clamp((item.value / maxVal) * 100, 1, 100);
          const color = item.color || "var(--brand)";

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              {showValues && (
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}>
                  {item.value}
                </span>
              )}
              <div style={{
                width: "100%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                height: `${pct}%`,
                minHeight: 4,
              }}>
                <motion.div
                  initial={animated ? { scaleY: 0, originY: 1 } : { scaleY: 1 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: animated ? i * 0.06 : 0 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: typeof color === "string" && !color.startsWith("var")
                      ? color
                      : `linear-gradient(180deg, ${color}dd 0%, ${color}88 100%)`,
                    background: color.includes("gradient")
                      ? color
                      : `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
                    borderRadius: "6px 6px 3px 3px",
                    position: "relative",
                    overflow: "hidden",
                    transformOrigin: "bottom",
                  }}
                >
                  {/* Shimmer */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                  }} />
                </motion.div>
              </div>
              <span style={{
                fontSize: "0.68rem",
                color: "var(--text-faint)",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Line Chart ─────────────────────────────────────────────────────────────── */
/**
 * LineChart — minimal SVG sparkline
 * data: [{ label, value }]
 */
export const LineChart = ({ data = [], height = 120, color = "var(--brand)", showArea = true }) => {
  const WIDTH = 600;
  const PADDING = { top: 12, right: 12, bottom: 28, left: 40 };

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range  = maxVal - minVal || 1;

  const innerW = WIDTH - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const points = data.map((d, i) => ({
    x: PADDING.left + (i / (data.length - 1 || 1)) * innerW,
    y: PADDING.top + (1 - (d.value - minVal) / range) * innerH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${PADDING.top + innerH} L ${points[0].x} ${PADDING.top + innerH} Z`;

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: Math.round(minVal + t * range),
    y: PADDING.top + (1 - t) * innerH,
  }));

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        style={{ width: "100%", height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0" />
          </linearGradient>
          <filter id="lineShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgb(59,130,246)" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              y1={t.y}
              x2={WIDTH - PADDING.right}
              y2={t.y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 8}
              y={t.y + 4}
              fontSize="10"
              fill="rgba(255,255,255,0.3)"
              textAnchor="end"
            >
              {t.val}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {showArea && data.length > 1 && (
          <path d={areaD} fill="url(#lineAreaGrad)" />
        )}

        {/* Line */}
        {data.length > 1 && (
          <motion.path
            d={pathD}
            fill="none"
            stroke="rgb(59,130,246)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineShadow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="rgb(59,130,246)" stroke="var(--bg-base)" strokeWidth={2} />
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 4}
            fontSize="10"
            fill="rgba(255,255,255,0.3)"
            textAnchor="middle"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

/* ─── Donut Chart ─────────────────────────────────────────────────────────────── */
/**
 * DonutChart
 * segments: [{ label, value, color }]
 * size: diameter (default 140)
 */
export const DonutChart = ({ segments = [], size = 140, strokeWidth = 22, label, sublabel }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const R     = (size - strokeWidth) / 2;
  const C     = size / 2;
  const circ  = 2 * Math.PI * R;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const arc = {
      ...seg,
      dash: pct * circ,
      offset,
      pct,
    };
    offset += pct * circ;
    return arc;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background track */}
          <circle
            cx={C} cy={C} r={R}
            fill="none"
            stroke="var(--bg-overlay)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <motion.circle
              key={i}
              cx={C} cy={C} r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${arc.dash} ${circ - arc.dash}` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.12 }}
            />
          ))}
        </svg>

        {/* Center label */}
        {(label || sublabel) && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {label && (
              <span style={{
                fontSize: size < 100 ? "1rem" : "1.4rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}>
                {label}
              </span>
            )}
            {sublabel && (
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: seg.color,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              {seg.label}
            </span>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", marginLeft: "auto", paddingLeft: "0.75rem" }}>
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Mini progress bar ────────────────────────────────────────────────────────── */
export const ProgressBar = ({ value = 0, max = 100, color = "var(--brand)", label, showPct = true, height = 6 }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {(label || showPct) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {label && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>}
          {showPct && <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{
        width: "100%",
        height,
        borderRadius: 99,
        background: "var(--bg-overlay)",
        overflow: "hidden",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 99,
            background: color,
          }}
        />
      </div>
    </div>
  );
};

/* ─── Rating stars ─────────────────────────────────────────────────────────────── */
export const StarRating = ({ value = 0, max = 5, size = 14, interactive = false, onChange }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: max }, (_, i) => (
      <span
        key={i}
        onClick={interactive ? () => onChange?.(i + 1) : undefined}
        style={{
          cursor: interactive ? "pointer" : "default",
          color: i < Math.floor(value) ? "#fbbf24" : i < value ? "#fbbf24" : "var(--bg-overlay)",
          fontSize: size,
          transition: "color 0.15s",
        }}
      >
        ★
      </span>
    ))}
  </div>
);
