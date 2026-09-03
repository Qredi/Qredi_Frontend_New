"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, login as apiLogin, setAuthToken } from "@/lib/api";
import type { UserOut } from "@/lib/types";

interface AuthContextValue {
  user: UserOut | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("qredi-auth-token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(readStoredToken);
  const router = useRouter();
  const initRef = useRef(false);
  const [authChecked, setAuthChecked] = useState(() => !readStoredToken());

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const stored = readStoredToken();
    if (!stored) return;

    apiFetch<UserOut>("/users/me")
      .then((u) => setUser(u))
      .catch(() => {
        setAuthToken(null);
        setToken(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const isLoading = !authChecked;

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      setAuthToken(data.access_token);
      setToken(data.access_token);
      setAuthChecked(true);
      const me = await apiFetch<UserOut>("/users/me");
      setUser(me);
      if (me.role === "umkm") {
        router.push("/myqredi/score");
      } else {
        router.push("/dashboard");
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
