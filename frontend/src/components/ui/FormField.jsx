import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon, { ICONS } from "./Icon";

/**
 * Reusable form field (label + input/textarea/select + error message)
 * Matches auth page styling exactly.
 */
export const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  rightEl,
  leftEl,
  index = 0,
  rows,
  children, // for select
  as = "input",
  hint,
}) => (
  <motion.div
    className="field-group"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 + index * 0.05 }}
  >
    {label && (
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>}
      </label>
    )}

    <div className="field-input-wrap">
      {leftEl && (
        <span style={{
          position: "absolute",
          left: "0.875rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 1,
        }}>
          {leftEl}
        </span>
      )}

      {as === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 4}
          className={`field-input${error ? " is-error" : ""}`}
          style={{
            height: "auto",
            padding: "0.75rem 0.9rem",
            resize: "vertical",
            paddingLeft: leftEl ? "2.5rem" : undefined,
          }}
        />
      ) : as === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`field-input${error ? " is-error" : ""}`}
          style={{
            paddingLeft: leftEl ? "2.5rem" : undefined,
            cursor: "pointer",
          }}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={type === "password" ? "current-password" : undefined}
          className={`field-input${error ? " is-error" : ""}${rightEl ? " has-icon-right" : ""}${leftEl ? " has-icon-left" : ""}`}
          style={{ paddingLeft: leftEl ? "2.5rem" : undefined }}
        />
      )}

      {rightEl && <span className="field-icon-right">{rightEl}</span>}
    </div>

    {hint && !error && (
      <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>{hint}</p>
    )}

    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key={error}
          className="field-error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon d={ICONS.warning} size={12} />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

/**
 * Toggle switch component for settings
 */
export const Toggle = ({ id, checked, onChange, label, description, disabled }) => (
  <div style={{
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "0.875rem 0",
    borderBottom: "1px solid var(--border)",
  }}>
    <div style={{ flex: 1 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            cursor: disabled ? "not-allowed" : "pointer",
            marginBottom: description ? "0.2rem" : 0,
          }}
        >
          {label}
        </label>
      )}
      {description && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>

    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 40,
        height: 22,
        borderRadius: 99,
        border: "none",
        background: checked ? "var(--brand)" : "var(--bg-overlay)",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        outline: "none",
        boxShadow: checked ? "0 0 0 2px rgba(59,130,246,0.25)" : "0 0 0 1px var(--border)",
      }}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{
          position: "absolute",
          top: 3,
          left: 0,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  </div>
);

/**
 * Section card wrapper for form sections
 */
export const FormSection = ({ title, description, children, action }) => (
  <div style={{
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  }}>
    {(title || description) && (
      <div style={{
        padding: "1.125rem 1.375rem",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        <div>
          {title && (
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
              {title}
            </h3>
          )}
          {description && (
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    )}
    <div style={{ padding: "1.375rem" }}>
      {children}
    </div>
  </div>
);

export default FormField;
