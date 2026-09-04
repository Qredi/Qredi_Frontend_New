"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Storefront,
  TrendUp,
  ShieldWarning,
  Database,
  CheckCircle,
  WarningCircle,
  Clock,
} from "@phosphor-icons/react";
import { apiFetch } from "@/lib/api";
import { applicationsStore } from "@/lib/applications-store";
import type {
  UserOut,
  ScoreOut,
  UMKMProfileOut,
  QrisTransactionOut,
  ACSScoreResponse,
} from "@/lib/types";
import {
  fraudFlagToRisk,
  loadProfileForUser,
  riskToCap,
} from "@/lib/applications";
import { formatScoreDate } from "@/lib/scores";

type TabKey = "overview" | "score" | "fraud" | "business";

export default function ApplicationDetailPage() {
  const params = useParams();
  const userId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [user, setUser] = useState<UserOut | null>(null);
  const [score, setScore] = useState<ScoreOut | null>(null);
  const [profile, setProfile] = useState<UMKMProfileOut | null>(null);
  const [transactions, setTransactions] = useState<QrisTransactionOut[]>([]);
  const [acsData, setAcsData] = useState<ACSScoreResponse | null>(null);
  const [acsState, setAcsState] = useState<"idle" | "loading" | "done">("idle");
  const acsRequested = useRef(false);
  const [loading, setLoading] = useState(true);

  const allApplications = useSyncExternalStore(
    applicationsStore.subscribe,
    applicationsStore.getSnapshot,
    applicationsStore.getServerSnapshot,
  );

  const application = useMemo(
    () => allApplications.find((a) => a.umkmId === userId),
    [allApplications, userId],
  );

  useEffect(() => {
    if (!userId) return;

    async function load() {
      // Setiap request ditangkap sendiri-sendiri: `GET /users/{id}` dan
      // `GET /umkm-profiles/by-user/{id}` hanya untuk admin, jadi kalau login
      // sebagai lender satu penolakan tidak boleh menggagalkan seluruh halaman.
      const [u, s, p, txns] = await Promise.all([
        apiFetch<UserOut>(`/users/${userId}`).catch(() => null),
        apiFetch<ScoreOut>(`/scores/by-user/${userId}/latest`).catch(
          () => null,
        ),
        loadProfileForUser(userId),
        apiFetch<QrisTransactionOut[]>(
          `/qris-transactions/by-user/${userId}?limit=500`,
        ).catch(() => [] as QrisTransactionOut[]),
      ]);

      setUser(u);
      setScore(s);
      setProfile(p);
      setTransactions(txns);
      setLoading(false);
    }
    load();
  }, [userId]);

  /**
   * `POST /acs-scores/{id}/score` menjalankan ulang ACS engine dan menulis
   * baris baru di tabel `scores`. Karena itu panggilannya baru dilakukan saat
   * tab "Score Analysis" dibuka, dan hanya sekali per kunjungan — sebelumnya
   * dipanggil di setiap page load sehingga riwayat skor UMKM terisi duplikat
   * dan terlihat stagnan.
   */
  const runAcsAnalysis = useCallback(() => {
    if (acsRequested.current || !userId) return;
    acsRequested.current = true;

    setAcsState("loading");
    apiFetch<ACSScoreResponse>(
      `/acs-scores/${userId}/score?technical_scope=true`,
      { method: "POST" },
    )
      .then((data) => setAcsData(data))
      .catch(() => setAcsData(null))
      .finally(() => setAcsState("done"));
  }, [userId]);

  const displayScore = score ? Math.round(score.acs_score) : 0;
  const riskLevel = score ? riskToCap(score.risk_level) : "Medium";
  const fraudFlags = transactions.filter((t) => t.fraud_flag).length;
  const fraudRisk = fraudFlagToRisk(fraudFlags);
  const totalTx = transactions.length;
  const avgValue =
    totalTx > 0
      ? Math.round(transactions.reduce((s, t) => s + t.amount, 0) / totalTx)
      : 0;

  // Volume bulan kalender terakhir yang benar-benar punya transaksi — data
  // seed bisa berakhir di bulan lalu, sehingga "bulan berjalan" akan 0.
  const monthlyVolume = useMemo(() => {
    if (transactions.length === 0) return 0;

    const times = transactions
      .map((t) => new Date(t.transaction_time))
      .filter((d) => !Number.isNaN(d.getTime()));
    if (times.length === 0) return 0;

    const latest = times.reduce((a, b) => (b > a ? b : a));
    return transactions
      .filter((t) => {
        const d = new Date(t.transaction_time);
        return (
          d.getMonth() === latest.getMonth() &&
          d.getFullYear() === latest.getFullYear()
        );
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const merchantName =
    profile?.business_name ??
    application?.businessName ??
    user?.full_name ??
    "Unknown";

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="h-24 bg-slate-100 animate-pulse rounded-lg mb-6" />
        <div className="h-10 bg-slate-100 animate-pulse rounded-lg mb-6" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Navigation & Header Section */}
      <div className="mb-4">
        <Link
          href="/dashboard/applications"
          className="mb-2 inline-flex items-center gap-1.5 text-base font-medium text-muted hover:text-foreground hover:underline transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Applications
        </Link>
      </div>

      {/* Application Header Card */}
      <div className="border border-border bg-surface p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-semibold text-muted">
                {userId.slice(0, 8)}
              </span>
              <span
                className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${getRiskBadge(
                  riskLevel,
                )}`}
              >
                {riskLevel} Risk
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-foreground py-2">
              {merchantName}
            </h1>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted">
              <span>{profile?.business_type ?? "UMKM"}</span>
              <span>&#8226;</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {application
                  ? `Applied ${new Date(application.submittedAt).toLocaleDateString("id-ID")}`
                  : score?.created_at
                    ? `Scored ${formatScoreDate(score.created_at)}`
                    : score
                      ? "Scored"
                      : "Not yet scored"}
              </span>
            </div>
          </div>

          {/* Right Header: Score & Risk Summary */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Credit Score
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {displayScore}
                </span>
                <span className="text-sm font-medium text-muted">/ 100</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Fraud Flags
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {fraudFlags}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex gap-2">
          {(
            [
              ["overview", "Overview", Storefront],
              ["score", "Score Analysis", TrendUp],
              ["fraud", "Fraud Risk", ShieldWarning],
              ["business", "Business Data", Database],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                if (key === "score") runAcsAnalysis();
              }}
              className={`flex items-center gap-2 border-b-2 py-3 px-5 text-base font-medium transition-colors ${
                activeTab === key
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent text-muted hover:border-border hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Business Profile */}
          <div className="border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">
              Business Profile
            </h3>
            <div className="space-y-4 text-base">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Business Name</span>
                <span className="font-medium text-foreground">
                  {merchantName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Business Category</span>
                <span className="font-medium text-foreground">
                  {profile?.business_type ?? "-"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Location</span>
                <span className="font-medium text-foreground">
                  {[profile?.city, profile?.province]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Years Operating</span>
                <span className="font-medium text-foreground">
                  {profile?.years_operating != null
                    ? `${profile.years_operating} Years`
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Loan Request / Transaction Summary */}
          <div className="border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">
              {application ? "Loan Request" : "Transaction Summary (QRIS)"}
            </h3>
            <div className="space-y-4 text-base">
              {application ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-muted">Product</span>
                    <span className="font-medium text-foreground">
                      {application.productTitle}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-muted">Requested Amount</span>
                    <span className="font-medium text-foreground">
                      Rp {application.requestedAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-muted">Tenor</span>
                    <span className="font-medium text-foreground">
                      {application.tenorMonths} months &#183;{" "}
                      {application.interestRate}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Match Score</span>
                    <span className="font-medium text-foreground">
                      {application.matchScore}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-muted">Total Transactions</span>
                    <span className="font-medium text-foreground">
                      {totalTx.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-muted">Avg. Transaction Value</span>
                    <span className="font-medium text-foreground">
                      Rp {avgValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Monthly Volume</span>
                    <span className="font-medium text-foreground">
                      Rp {monthlyVolume.toLocaleString("id-ID")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCORE ANALYSIS (SHAP Explainability) */}
      {activeTab === "score" && (
        <div className="border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Score Explanation (SHAP Factors)
            </h3>
            <p className="text-sm text-muted">
              Key drivers contributing positively or negatively to the final
              credit score of {displayScore}/100.
            </p>
          </div>

          <div className="space-y-4">
            {acsState === "loading" ? (
              <div className="text-muted text-sm">
                Running the scoring engine...
              </div>
            ) : acsData?.technical_explanation?.top_drivers?.length ? (
              acsData.technical_explanation.top_drivers.map((driver, idx) => {
                const isPositive = driver.direction === "positive";
                const impactVal = Math.round(
                  Math.abs(driver.shap_contribution) * 100,
                );
                return (
                  <div key={idx} className="flex items-center gap-4 text-base">
                    <span className="w-52 shrink-0 font-medium text-foreground">
                      {driver.feature}
                    </span>
                    <span
                      className={`w-10 text-right font-semibold shrink-0 ${
                        isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isPositive ? "+" : "-"}
                      {impactVal}
                    </span>
                    <div className="h-2 flex-1 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                      <div
                        className={`h-full rounded-sm transition-all duration-300 ${
                          isPositive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.min(impactVal * 2, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted text-sm">
                Score explanation data not available for this user.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FRAUD RISK (Anti-Gestun Layer) */}
      {activeTab === "fraud" && (
        <div className="border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6 border-b border-border pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Transaction Integrity & Anti-Gestun Analysis
              </h3>
              <p className="text-sm text-muted">
                Signal verification to detect engineered transactions and
                abnormal QRIS patterns.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted">
                Integrity Status:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold ${
                  fraudFlags === 0
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {fraudFlags === 0 ? (
                  <CheckCircle size={14} weight="fill" />
                ) : (
                  <WarningCircle size={14} weight="fill" />
                )}
                {fraudFlags === 0 ? "Healthy" : `${fraudFlags} Flag(s)`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                label: "Transaction Pattern",
                status: fraudFlags === 0 ? "Normal" : `${fraudFlags} anomalies`,
                isAnomaly: fraudFlags > 0,
              },
              {
                label: "Fraud Risk Level",
                status: fraudRisk,
                isAnomaly: fraudRisk !== "Low",
              },
              {
                label: "Total Transactions",
                status: `${totalTx} transactions analyzed`,
                isAnomaly: false,
              },
              {
                label: "Suspicious Activity",
                status: fraudFlags === 0 ? "None Detected" : "Review Required",
                isAnomaly: fraudFlags > 0,
              },
            ].map((ind, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-border bg-background p-4 rounded-sm"
              >
                <div>
                  <p className="text-base font-medium text-foreground">
                    {ind.label}
                  </p>
                  <p className="text-base text-muted mt-0.5">{ind.status}</p>
                </div>
                {ind.isAnomaly ? (
                  <WarningCircle
                    size={24}
                    className="text-amber-500"
                    weight="fill"
                  />
                ) : (
                  <CheckCircle
                    size={24}
                    className="text-emerald-600"
                    weight="fill"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BUSINESS DATA */}
      {activeTab === "business" && (
        <div className="border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">
            Extracted Feature Metrics (XGBoost Input Data)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-base">
            <div className="border border-border p-4 bg-background">
              <p className="font-semibold text-foreground mb-2">
                Transaction Metrics
              </p>
              <ul className="space-y-2 text-muted">
                <li className="flex justify-between">
                  <span>Total Transactions:</span>
                  <span className="text-foreground font-medium">
                    {totalTx.toLocaleString()}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Avg. Transaction Value:</span>
                  <span className="text-foreground font-medium">
                    Rp {avgValue.toLocaleString("id-ID")}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Monthly Volume:</span>
                  <span className="text-foreground font-medium">
                    Rp {monthlyVolume.toLocaleString("id-ID")}
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-border p-4 bg-background">
              <p className="font-semibold text-foreground mb-2">
                Account Attributes
              </p>
              <ul className="space-y-2 text-muted">
                <li className="flex justify-between">
                  <span>Business Type:</span>
                  <span className="text-foreground font-medium">
                    {profile?.business_type ?? "-"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Employee Count:</span>
                  <span className="text-foreground font-medium">
                    {profile?.employee_count ?? "-"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Monthly Revenue:</span>
                  <span className="text-foreground font-medium">
                    {profile?.monthly_revenue
                      ? `Rp ${profile.monthly_revenue.toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
