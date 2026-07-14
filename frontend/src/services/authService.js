/**
 * authService.js
 * ──────────────
 * Low-level API wrappers for authentication endpoints.
 * Used internally by AuthContext — components should use useAuth() instead.
 */
import axiosInstance from "../api/axiosInstance";

const authService = {
  /**
   * POST /auth/login
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, user: object }>}
   */
  login: async (email, password) => {
    const response = await axiosInstance.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * POST /auth/register
   * @param {{ name: string, email: string, password: string, role: string }} userData
   * @returns {Promise<{ token: string, user: object }>}
   */
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  /**
   * GET /auth/me
   * Verifies the current token and retrieves the user profile.
   * @returns {Promise<object>} user
   */
  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },

  /**
   * POST /auth/logout
   * Server-side session invalidation (optional — depends on backend implementation).
   */
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Silently ignore — client-side cleanup is always performed regardless.
    }
  },
};

export default authService;
