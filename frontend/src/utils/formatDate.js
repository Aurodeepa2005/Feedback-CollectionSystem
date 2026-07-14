/**
 * formatDate.js
 * ─────────────
 * Date formatting utilities.
 */

/**
 * Formats an ISO date string to a human-readable form.
 * @param {string|Date} date
 * @param {"short"|"long"|"relative"} style
 * @returns {string}
 */
export const formatDate = (date, style = "short") => {
  const d = new Date(date);
  if (isNaN(d)) return "Invalid date";

  if (style === "relative") {
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
  }

  if (style === "long") {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // short (default)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Returns true if the given date is in the past.
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isPast = (date) => new Date(date) < new Date();

/**
 * Returns the number of days remaining until a due date.
 * Returns a negative number if overdue.
 * @param {string|Date} dueDate
 * @returns {number}
 */
export const daysUntil = (dueDate) => {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};
