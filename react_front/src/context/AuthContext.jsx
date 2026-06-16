import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "carsbusiness_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { accessToken: "", user: null };
  });

  useEffect(() => {
    if (auth.accessToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!auth.accessToken) return;
      try {
        const { data } = await api.get("/user/me");
        if (!cancelled) {
          setAuth((a) => ({
            ...a,
            user: {
              id: data._id,
              email: data.email,
              first_name: data.first_name,
              last_name: data.last_name,
              role: data.role,
              phone: data.phone,
            },
          }));
        }
      } catch {
        if (!cancelled) setAuth({ accessToken: "", user: null });
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [auth.accessToken]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setAuth({ accessToken: "", user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
