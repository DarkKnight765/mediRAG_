import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../api/config";

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("medirag_token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("medirag_token");
  }, []);

  // Check if token is valid on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch {
        // Token invalid/expired — clear it
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("medirag_token", newToken);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
      name,
      email,
      password,
    });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("medirag_token", newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
