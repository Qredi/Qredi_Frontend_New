import type { BackendDetailError } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.qredi.id/api/v1";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export type PortalType = "b2c" | "b2b";

export const STORAGE_KEY_B2C = "qredi-b2c-token";
export const STORAGE_KEY_B2B = "qredi-b2b-token";
const LEGACY_STORAGE_KEY = "qredi-auth-token";

export function getCurrentPortal(): PortalType {
  if (typeof window === "undefined") return "b2c";
  return window.location.pathname.startsWith("/dashboard") ? "b2b" : "b2c";
}

export function getAuthToken(portal?: PortalType): string | null {
  if (typeof window === "undefined") return null;
  const activePortal = portal ?? getCurrentPortal();
  const key = activePortal === "b2b" ? STORAGE_KEY_B2B : STORAGE_KEY_B2C;
  return localStorage.getItem(key) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
}

export function setAuthToken(token: string | null, portal?: PortalType) {
  if (typeof window === "undefined") return;
  const activePortal = portal ?? getCurrentPortal();
  const key = activePortal === "b2b" ? STORAGE_KEY_B2B : STORAGE_KEY_B2C;
  if (token) {
    localStorage.setItem(key, token);
  } else {
    localStorage.removeItem(key);
  }
  // Hapus legacy token agar tidak terjadi benturan
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Authorization")) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData) &&
    options.body
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as BackendDetailError;
      if (body.detail) {
        detail =
          typeof body.detail === "string"
            ? body.detail
            : JSON.stringify(body.detail);
      }
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    let detail = "Login failed";
    try {
      const data = (await res.json()) as BackendDetailError;
      if (data.detail) {
        if (typeof data.detail === "string") {
          detail = data.detail;
        } else if (Array.isArray(data.detail)) {
          detail = data.detail
            .map((item: unknown) => {
              if (typeof item === "object" && item !== null && "msg" in item) {
                return String((item as { msg: unknown }).msg);
              }
              return JSON.stringify(item);
            })
            .join(", ");
        } else {
          detail = JSON.stringify(data.detail);
        }
      }
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<{ access_token: string; token_type: string }>;
}
