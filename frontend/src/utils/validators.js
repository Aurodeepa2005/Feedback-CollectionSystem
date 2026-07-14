/**
 * validators.js
 * ─────────────
 * Reusable form validation helpers.
 */

/**
 * Checks if a string is a valid email address.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Checks if a password meets the minimum security requirements.
 * - At least 6 characters
 * - Contains at least one letter and one number
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain a letter and a number." };
  }
  return { valid: true, message: "" };
};

/**
 * Validates that two password strings match.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ valid: boolean, message: string }}
 */
export const passwordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  return { valid: true, message: "" };
};

/**
 * Checks if a string is non-empty after trimming.
 * @param {string} value
 * @returns {boolean}
 */
export const isRequired = (value) =>
  typeof value === "string" && value.trim().length > 0;
