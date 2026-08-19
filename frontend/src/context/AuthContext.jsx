import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  TOKEN_KEY,
  login as apiLogin,
  fetchMe,
  fetchStats,
} from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchStats();
      setStats(s);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((u) => {
        setUser(u);
        loadStats();
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, [loadStats]);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    const u = await fetchMe();
    setUser(u);
    await loadStats();
    return u;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStats(null);
  };

  const refreshStats = loadStats;

  return (
    <AuthContext.Provider
      value={{ user, loading, stats, login, logout, refreshStats }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
