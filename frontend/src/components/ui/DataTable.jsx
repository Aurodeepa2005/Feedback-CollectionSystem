import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon, { ICONS } from "./Icon";

/**
 * DataTable — sortable, filterable, paginated table
 *
 * Props:
 *  - columns: [{ key, label, sortable?, render? }]
 *  - data: Array of row objects
 *  - searchable: boolean (default true)
 *  - searchPlaceholder: string
 *  - pageSize: number (default 10)
 *  - actions: (row) => ReactNode (optional row action buttons)
 *  - emptyMessage: string
 *  - loading: boolean
 */
const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = "Search…",
  pageSize = 10,
  actions,
  emptyMessage = "No data found.",
  loading = false,
  onRowClick,
}) => {
  const [query, setQuery]       = useState("");
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState("asc");
  const [page, setPage]         = useState(1);

  /* ── Filtering ─────────────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, query, columns]);

  /* ── Sorting ───────────────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  /* ── Pagination ────────────────────────────────────────────────────────── */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged      = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const hasActions = !!actions;
  const visibleColumns = hasActions ? [...columns, { key: "_actions", label: "" }] : columns;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {/* Search bar */}
      {searchable && (
        <div style={{ position: "relative", maxWidth: 320 }}>
          <div style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            pointerEvents: "none",
            display: "flex",
          }}>
            <Icon d={ICONS.search} size={14} />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="field-input"
            style={{ paddingLeft: "2.25rem", height: 38, fontSize: "0.82rem" }}
          />
        </div>
      )}

      {/* Table wrapper */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.sortable !== false && col.key !== "_actions" ? () => handleSort(col.key) : undefined}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--text-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      cursor: col.sortable !== false && col.key !== "_actions" ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      background: "var(--bg-elevated)",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (col.key !== "_actions") e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-faint)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {col.label}
                      {col.sortable !== false && col.key !== "_actions" && (
                        <span style={{ opacity: sortKey === col.key ? 1 : 0.3 }}>
                          {sortKey === col.key && sortDir === "desc" ? (
                            <Icon d={ICONS["arrow-down"]} size={11} strokeWidth={2.5} />
                          ) : (
                            <Icon d={ICONS["arrow-up"]} size={11} strokeWidth={2.5} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={visibleColumns.length} style={{ padding: "3rem", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "2px solid rgba(99,102,241,0.2)",
                          borderTopColor: "var(--brand)",
                          animation: "spin 0.65s linear infinite",
                        }} />
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={visibleColumns.length} style={{
                      padding: "3rem",
                      textAlign: "center",
                      fontSize: "0.83rem",
                      color: "var(--text-muted)",
                    }}>
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paged.map((row, ri) => (
                    <motion.tr
                      key={row.id ?? ri}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: ri * 0.03 }}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      style={{
                        borderBottom: ri < paged.length - 1 ? "1px solid var(--border)" : "none",
                        cursor: onRowClick ? "pointer" : "default",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-highlight)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            verticalAlign: "middle",
                            whiteSpace: col.key === "_actions" ? "nowrap" : undefined,
                          }}
                        >
                          {col.key === "_actions"
                            ? <div style={{ display: "flex", gap: "0.375rem", justifyContent: "flex-end" }}>{actions(row)}</div>
                            : col.render
                              ? col.render(row[col.key], row)
                              : (row[col.key] ?? "—")}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div style={{
            borderTop: "1px solid var(--border)",
            padding: "0.625rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            flexWrap: "wrap",
            background: "var(--bg-elevated)",
          }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <PaginationBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1} label="Previous">
                <Icon d={ICONS["chevron-left"]} size={14} />
              </PaginationBtn>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <PaginationBtn
                    key={p}
                    onClick={() => setPage(p)}
                    active={page === p}
                    label={p}
                  >
                    {p}
                  </PaginationBtn>
                );
              })}
              <PaginationBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} label="Next">
                <Icon d={ICONS.chevron} size={14} />
              </PaginationBtn>
            </div>
          </div>
        )}
      </div>

      {/* Result count */}
      {searchable && query && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {sorted.length} result{sorted.length !== 1 ? "s" : ""} for "{query}"
        </p>
      )}
    </div>
  );
};

const PaginationBtn = ({ onClick, disabled, active, label, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-current={active ? "page" : undefined}
    style={{
      width: 30,
      height: 30,
      borderRadius: 6,
      border: active ? "1px solid var(--border-brand)" : "1px solid var(--border)",
      background: active ? "var(--brand-muted)" : "transparent",
      color: active ? "var(--brand-hover)" : "var(--text-muted)",
      fontSize: "0.78rem",
      fontWeight: active ? 600 : 400,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      fontFamily: "inherit",
    }}
    onMouseEnter={(e) => {
      if (!disabled && !active) {
        e.currentTarget.style.background = "var(--bg-highlight)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.color = "var(--text-primary)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled && !active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--text-muted)";
      }
    }}
  >
    {children}
  </button>
);

export default DataTable;
