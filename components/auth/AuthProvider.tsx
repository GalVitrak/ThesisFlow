"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser, signIn, signOut } from "@/lib/services/authService";
import { getDataSource } from "@/lib/services/dataSource";
import { subscribeAuth } from "@/lib/services/firebase/authService.firebase";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getCurrentUser();
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getDataSource() === "firebase") {
      setLoading(true);
      const unsub = subscribeAuth((u) => {
        setUser(u);
        setLoading(false);
      });
      return unsub;
    }
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: async (email: string, password: string) => {
        const u = await signIn(email, password);
        setUser(u);
        return u;
      },
      signOut: async () => {
        await signOut();
        setUser(null);
      },
      refresh,
    }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
