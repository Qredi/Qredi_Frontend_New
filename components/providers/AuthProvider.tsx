"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  apiFetch,
  getAuthToken,
  login as apiLogin,
  setAuthToken,
  type PortalType,
} from "@/lib/api";
import type { UserOut } from "@/lib/types";

interface AuthContextValue {
  user: UserOut | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const portal: PortalType = pathname?.startsWith("/dashboard") ? "b2b" : "b2c";

  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Load session spesifik untuk portal yang sedang aktif (B2C /myqredi vs B2B /dashboard)
  useEffect(() => {
    const stored = getAuthToken(portal);
    setToken(stored);

    if (!stored) {
      setUser(null);
      setAuthChecked(true);
      return;
    }

    setAuthChecked(false);
    apiFetch<UserOut>("/users/me", {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((u) => {
        // Validasi agar role user selaras dengan portal aktif
        const isB2BUser = u.role === "lender" || u.role === "admin";
        const isB2CUser = u.role === "umkm";

        if ((portal === "b2b" && isB2BUser) || (portal === "b2c" && isB2CUser)) {
          setUser(u);
        } else {
          // Token ada tapi rolenya untuk portal lain
          setUser(null);
        }
      })
      .catch(() => {
        setAuthToken(null, portal);
        setToken(null);
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, [portal]);

  const isLoading = !authChecked;

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      // Ambil profile dengan token baru secara eksplisit
      const me = await apiFetch<UserOut>("/users/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      const userPortal: PortalType = me.role === "umkm" ? "b2c" : "b2b";
      setAuthToken(data.access_token, userPortal);
      setToken(data.access_token);
      setUser(me);
      setAuthChecked(true);

      if (me.role === "umkm") {
        router.push("/myqredi/score");
      } else {
        router.push("/dashboard");
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    setAuthToken(null, portal);
    setToken(null);
    setUser(null);
    if (portal === "b2b") {
      router.push("/dashboard/login");
    } else {
      router.push("/myqredi/login");
    }
  }, [portal, router]);

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
