import React from "react";
import { Link } from "react-router-dom";

/**
 * Footer
 * -------
 * A minimal, dark-themed footer consistent with the FeedbackHub design system.
 * Shown at the bottom of the ShellLayout's main content area.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "1.75rem 2rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.875rem",
        background: "var(--bg-base)",
      }}
    >
      {/* Left — Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <span style={{ fontSize: "1.05rem" }}>💬</span>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "-0.01em",
          }}
        >
          FeedbackHub
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-faint)",
            marginLeft: "0.25rem",
          }}
        >
          © {year} All rights reserved.
        </span>
      </div>

      {/* Center — Version badge */}
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 99,
          padding: "0.2rem 0.65rem",
        }}
      >
        v1.0.0 — Beta
      </span>

      {/* Right — Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        {[
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Use",  href: "#" },
          { label: "Support",       href: "#" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontSize: "0.75rem",
              color: "var(--text-faint)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
