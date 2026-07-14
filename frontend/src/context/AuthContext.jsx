import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "../api/axiosInstance";

// ─── Context Creation ─────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Helper: persist session ──────────────────────────────────────────────────
const persistSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ─── AuthProvider ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on first mount while we restore session

  // Derived flag
  const isAuthenticated = !!user;

  // ── Restore session on first mount ────────────────────────────────────────
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        // Corrupted localStorage data — clear it
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Listen for auto-logout events dispatched by axios interceptor ──────────
  useEffect(() => {
    const handleAutoLogout = () => {
      setUser(null);
      clearSession();
    };

    window.addEventListener("auth:logout", handleAutoLogout);
    return () => window.removeEventListener("auth:logout", handleAutoLogout);
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    const { token, user: loggedInUser } = response.data;

    persistSession(token, loggedInUser);
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  // ── register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);

    const { token, user: registeredUser } = response.data;

    persistSession(token, registeredUser);
    setUser(registeredUser);

    return registeredUser;
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── useAuth custom hook ──────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
