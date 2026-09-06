/**
 * Penyimpanan pengajuan pembiayaan yang dibagi antara MyQredi (UMKM) dan
 * Qredi Dashboard (lender).
 *
 * Kenapa disimpan di browser dan bukan di backend:
 * `POST /api/v1/matches/` di backend hanya boleh dipanggil role `lender` atau
 * `admin` (lender_id diambil dari user yang login), sehingga UMKM tidak bisa
 * membuat pengajuan sendiri lewat API. Selama endpoint itu belum dibuka untuk
 * UMKM, pengajuan dicatat di sini supaya alur "UMKM apply -> muncul di
 * dashboard lender" tetap utuh.
 *
 * `submitApplication()` tetap mencoba backend lebih dulu; kalau backend sudah
 * menerima, `syncedToBackend` bernilai true dan store ini hanya jadi cache.
 *
 * Pola store-nya mengikuti `lib/chat-history.ts` (useSyncExternalStore +
 * localStorage + event `storage` supaya tab lain ikut ter-update).
 */

import type { MatchStatus, RiskLevel } from "./types";

export interface SubmittedApplication {
  /** id match dari backend kalau tersinkron, kalau tidak id lokal. */
  id: string;
  productId: string;
  productTitle: string;
  institution: string;
  umkmId: string;
  umkmName: string;
  businessName: string;
  businessType: string | null;
  city: string | null;
  acsScore: number;
  riskLevel: RiskLevel;
  matchScore: number;
  requestedAmount: number;
  tenorMonths: number;
  interestRate: number;
  status: MatchStatus;
  /** ISO timestamp. */
  submittedAt: string;
  syncedToBackend: boolean;
}

const STORAGE_KEY = "qredi-loan-applications";

const SERVER_SNAPSHOT: SubmittedApplication[] = [];

let cached: SubmittedApplication[] | null = null;
const listeners = new Set<() => void>();

function read(): SubmittedApplication[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;
    const parsed = JSON.parse(raw) as SubmittedApplication[];
    return Array.isArray(parsed) ? parsed : SERVER_SNAPSHOT;
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function getSnapshot(): SubmittedApplication[] {
  if (cached === null) cached = read();
  return cached;
}

function getServerSnapshot(): SubmittedApplication[] {
  return SERVER_SNAPSHOT;
}

function emit() {
  for (const fn of listeners) fn();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: SubmittedApplication[]) {
  cached = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // kuota penuh / storage diblokir — state in-memory tetap jalan
    }
  }
  emit();
}

function add(application: SubmittedApplication) {
  const prev = getSnapshot();
  // Satu UMKM hanya boleh punya satu pengajuan aktif per produk.
  const withoutDuplicate = prev.filter(
    (a) =>
      !(
        a.umkmId === application.umkmId && a.productId === application.productId
      ),
  );
  write([application, ...withoutDuplicate]);
}

function setStatus(id: string, status: MatchStatus) {
  const prev = getSnapshot();
  const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
  if (next.every((a, i) => a === prev[i])) return;
  write(next);
}

export const applicationsStore = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  add,
  setStatus,
};

/** Pengajuan milik satu UMKM. */
export function applicationsForUmkm(
  all: SubmittedApplication[],
  umkmId: string | undefined,
): SubmittedApplication[] {
  if (!umkmId) return [];
  return all.filter((a) => a.umkmId === umkmId);
}
