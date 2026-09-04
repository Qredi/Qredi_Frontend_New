import { apiFetch } from "./api";
import type {
  MatchOut,
  QrisTransactionOut,
  RiskLevel,
  ScoreOut,
  UMKMProfileOut,
  UserOut,
} from "./types";
import type { SubmittedApplication } from "./applications-store";

export interface Application {
  id: string;
  merchantName: string;
  businessType: string;
  creditScore: number;
  riskLevel: "Low" | "Medium" | "High";
  fraudRisk: "Low" | "Moderate" | "Elevated";
  requestedAmount: string;
  submittedAt: string;
  userId: string;
  profile: UMKMProfileOut | null;
  score: ScoreOut | null;
  /** true kalau baris ini berasal dari pengajuan nyata, bukan sekadar pipeline. */
  isApplication: boolean;
}

export function scoreToRisk(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

export function riskToCap(risk: string): "Low" | "Medium" | "High" {
  switch (risk) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Medium";
  }
}

export function fraudFlagToRisk(
  flaggedCount: number,
): "Low" | "Moderate" | "Elevated" {
  if (flaggedCount === 0) return "Low";
  if (flaggedCount <= 2) return "Moderate";
  return "Elevated";
}

/**
 * Kota yang dipakai seeder backend. `GET /umkm-profiles/` mewajibkan filter
 * `city` atau `province`, dan role `lender` tidak boleh memanggil
 * `GET /users/`, jadi daftar profil untuk lender dikumpulkan per kota.
 */
const SEEDED_CITIES = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Semarang",
  "Medan",
  "Makassar",
  "Denpasar",
  "Malang",
  "Solo",
];

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];

function toTitle(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function tryFetch<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch {
    return null;
  }
}

/** Profil UMKM per user_id, dikumpulkan dari endpoint yang boleh diakses lender. */
async function loadProfilesByUser(): Promise<Map<string, UMKMProfileOut>> {
  const results = await Promise.all(
    SEEDED_CITIES.map((city) =>
      tryFetch<UMKMProfileOut[]>(
        `/umkm-profiles/?city=${encodeURIComponent(city)}`,
      ),
    ),
  );

  const byUser = new Map<string, UMKMProfileOut>();
  for (const list of results) {
    for (const profile of list ?? []) {
      byUser.set(profile.user_id, profile);
    }
  }
  return byUser;
}

/**
 * user_id UMKM yang pernah di-scoring.
 *
 * `GET /users/?role=umkm` hanya untuk admin, sehingga lender tidak bisa
 * memakai daftar user sebagai titik awal. `GET /scores/by-risk-level/{level}`
 * terbuka untuk lender dan admin dan mengembalikan `user_id` — itu yang
 * dipakai untuk menemukan UMKM yang punya skor.
 */
async function loadScoredUserIds(): Promise<string[]> {
  const results = await Promise.all(
    RISK_LEVELS.map((level) =>
      tryFetch<ScoreOut[]>(`/scores/by-risk-level/${level}?limit=200`),
    ),
  );

  const ids = new Set<string>();
  for (const list of results) {
    for (const score of list ?? []) ids.add(score.user_id);
  }
  return [...ids];
}

/**
 * Skor terbaru per user.
 *
 * Wajib lewat `/scores/by-user/{id}/latest` — endpoint itu yang mengurutkan
 * `created_at DESC` di backend. Hasil `by-risk-level` tidak bisa dipakai
 * langsung karena mengembalikan seluruh riwayat tanpa urutan, sehingga satu
 * user bisa muncul di beberapa bucket sekaligus (mis. pernah `high` lalu
 * `low`) dan skor lama bisa terpilih.
 */
async function loadLatestScores(
  userIds: string[],
): Promise<Map<string, ScoreOut>> {
  const entries = await Promise.all(
    userIds.map(async (userId) => {
      const score = await tryFetch<ScoreOut>(
        `/scores/by-user/${userId}/latest`,
      );
      return [userId, score] as const;
    }),
  );

  const byUser = new Map<string, ScoreOut>();
  for (const [userId, score] of entries) {
    if (score) byUser.set(userId, score);
  }
  return byUser;
}

/**
 * Daftar merchant untuk dashboard lender.
 *
 * Admin memakai `GET /users/` (nama lengkap tersedia); kalau ditolak 403
 * (berarti login sebagai lender) daftar disusun dari skor + profil UMKM.
 */
export async function loadMerchantPipeline(): Promise<Application[]> {
  const [users, profiles, scoredUserIds] = await Promise.all([
    tryFetch<UserOut[]>("/users/?role=umkm&limit=100"),
    loadProfilesByUser(),
    loadScoredUserIds(),
  ]);

  const userIds = users
    ? users.map((u) => u.id)
    : [...new Set([...scoredUserIds, ...profiles.keys()])];

  const usersById = new Map((users ?? []).map((u) => [u.id, u]));
  const scores = await loadLatestScores(userIds);

  return userIds.map((userId) => {
    const profile = profiles.get(userId) ?? null;
    const score = scores.get(userId) ?? null;
    const user = usersById.get(userId);

    return {
      id: userId,
      merchantName:
        profile?.business_name ?? user?.full_name ?? `UMKM ${userId.slice(0, 8)}`,
      businessType: profile?.business_type
        ? toTitle(profile.business_type)
        : "UMKM",
      creditScore: score?.acs_score ?? 0,
      riskLevel: riskToCap(score?.risk_level ?? "medium"),
      fraudRisk: "Low" as const,
      requestedAmount: "-",
      submittedAt: "",
      userId,
      profile,
      score,
      isApplication: false,
    };
  });
}

/** Pengajuan yang sudah masuk ke backend sebagai `match`. */
export async function loadBackendApplications(
  profiles?: Map<string, UMKMProfileOut>,
): Promise<Application[]> {
  const matches = await tryFetch<MatchOut[]>("/matches/by-lender/me/pending");
  if (!matches || matches.length === 0) return [];

  const profilesByUser = profiles ?? (await loadProfilesByUser());

  return matches.map((match) => {
    const profile = profilesByUser.get(match.umkm_id) ?? null;
    return {
      id: match.id,
      merchantName:
        profile?.business_name ?? `UMKM ${match.umkm_id.slice(0, 8)}`,
      businessType: profile?.business_type
        ? toTitle(profile.business_type)
        : "UMKM",
      creditScore: (match.match_score ?? 0) * 100,
      riskLevel: "Medium" as const,
      fraudRisk: "Low" as const,
      requestedAmount: match.recommended_limit
        ? `Rp ${match.recommended_limit.toLocaleString("id-ID")}`
        : "-",
      submittedAt: "",
      userId: match.umkm_id,
      profile,
      score: null,
      isApplication: true,
    };
  });
}

/** Pengajuan yang dikirim dari MyQredi (belum diterima backend). */
export function localApplicationToRow(
  application: SubmittedApplication,
): Application {
  return {
    id: application.id,
    merchantName: application.businessName || application.umkmName,
    businessType: application.businessType
      ? toTitle(application.businessType)
      : "UMKM",
    creditScore: application.acsScore,
    riskLevel: riskToCap(application.riskLevel),
    fraudRisk: "Low",
    requestedAmount: `Rp ${application.requestedAmount.toLocaleString("id-ID")}`,
    submittedAt: application.submittedAt,
    userId: application.umkmId,
    profile: null,
    score: null,
    isApplication: true,
  };
}

/**
 * Gabungkan pengajuan nyata dengan pipeline merchant.
 *
 * Pengajuan ditaruh di atas, dan merchant yang sudah mengajukan tidak
 * ditampilkan dua kali — barisnya diperkaya dengan nominal pengajuan.
 */
export function mergeApplications(
  pipeline: Application[],
  applications: Application[],
): Application[] {
  const appliedUserIds = new Set(applications.map((a) => a.userId));
  const pipelineByUser = new Map(pipeline.map((p) => [p.userId, p]));

  const enrichedApplications = applications.map((application) => {
    const merchant = pipelineByUser.get(application.userId);
    if (!merchant) return application;

    return {
      ...application,
      merchantName: merchant.merchantName,
      businessType: merchant.businessType,
      // Skor & risiko dari pipeline lebih otoritatif (langsung dari ACS engine).
      creditScore: merchant.creditScore || application.creditScore,
      riskLevel: merchant.score ? merchant.riskLevel : application.riskLevel,
      fraudRisk: merchant.fraudRisk,
      profile: merchant.profile ?? application.profile,
      score: merchant.score ?? application.score,
    };
  });

  const rest = pipeline.filter((p) => !appliedUserIds.has(p.userId));
  return [...enrichedApplications, ...rest];
}

/**
 * Profil satu UMKM.
 *
 * `GET /umkm-profiles/by-user/{id}` hanya boleh diakses pemiliknya sendiri
 * atau admin, jadi untuk lender dipakai jalur `GET /umkm-profiles/?city=`.
 */
export async function loadProfileForUser(
  userId: string,
): Promise<UMKMProfileOut | null> {
  const direct = await tryFetch<UMKMProfileOut>(
    `/umkm-profiles/by-user/${userId}`,
  );
  if (direct) return direct;

  const profiles = await loadProfilesByUser();
  return profiles.get(userId) ?? null;
}

/**
 * Isi kolom Fraud Risk dari data transaksi asli.
 *
 * Dijalankan sebagai pass kedua setelah tabel tampil supaya halaman tidak
 * menunggu satu request per merchant. Hitungannya berdasarkan 200 transaksi
 * terakhir tiap merchant (endpoint mengurutkan dari yang terbaru).
 */
export async function enrichWithFraudRisk(
  apps: Application[],
): Promise<Application[]> {
  const userIds = [...new Set(apps.map((a) => a.userId))];

  const counts = await Promise.all(
    userIds.map(async (userId) => {
      const txns = await tryFetch<QrisTransactionOut[]>(
        `/qris-transactions/by-user/${userId}?limit=200`,
      );
      return [userId, txns?.filter((t) => t.fraud_flag).length ?? 0] as const;
    }),
  );

  const byUser = new Map(counts);
  return apps.map((app) => ({
    ...app,
    fraudRisk: fraudFlagToRisk(byUser.get(app.userId) ?? 0),
  }));
}
