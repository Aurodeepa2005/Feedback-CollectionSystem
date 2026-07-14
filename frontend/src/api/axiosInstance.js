import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attaches the Bearer token from localStorage to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles 401 Unauthorized responses and expired tokens globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      // Handle 401 Unauthorized — token is missing, invalid, or expired
      if (status === 401) {
        const isTokenExpired =
          data?.message?.toLowerCase().includes("expired") ||
          data?.message?.toLowerCase().includes("invalid token") ||
          data?.error?.toLowerCase().includes("expired") ||
          data?.error?.toLowerCase().includes("unauthorized");

        if (isTokenExpired || status === 401) {
          // Clear all authentication data from localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Dispatch a custom event so AuthContext can react
          window.dispatchEvent(new Event("auth:logout"));

          // Redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }

      // Handle 403 Forbidden — user doesn't have required role/permission
      if (status === 403) {
        if (window.location.pathname !== "/unauthorized") {
          window.location.href = "/unauthorized";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
