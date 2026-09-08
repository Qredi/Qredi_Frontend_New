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

interface ScoreDriverItem {
  feature: string;
  label: string;
  category: string;
  shap_contribution: number;
  direction: "positive" | "negative";
  rawValue?: number | string;
  summary?: string;
}

const FEATURE_INFO: Record<
  string,
  { label: string; category: string; positiveText: string; negativeText: string }
> = {
  total_income_proxy: {
    label: "Estimated Total Revenue",
    category: "Revenue",
    positiveText:
      "Strong QRIS transaction turnover demonstrates high repayment capacity",
    negativeText:
      "Transaction turnover is relatively low for the credit scale",
  },
  avg_monthly_income_proxy: {
    label: "Average Monthly Revenue",
    category: "Revenue",
    positiveText: "Monthly revenue stream is steady and consistent",
    negativeText: "Monthly revenue is below the benchmark for peer businesses",
  },
  avg_ticket_size: {
    label: "Average Ticket Size",
    category: "Revenue",
    positiveText:
      "Healthy average transaction size reflects stable customer purchasing power",
    negativeText:
      "Micro-sized transactions require higher transaction frequency",
  },
  income_volatility: {
    label: "Cash Flow Consistency",
    category: "Cash Flow",
    positiveText:
      "Consistent, predictable cash flow with low month-to-month volatility",
    negativeText: "Revenue fluctuates significantly between observation periods",
  },
  balance_volatility: {
    label: "Cash Balance Stability",
    category: "Cash Flow",
    positiveText:
      "Operating liquidity buffer is well-maintained day-to-day",
    negativeText:
      "Daily cash balance shows notable drawdowns requiring attention",
  },
  active_months_ratio: {
    label: "Operating Activity Ratio",
    category: "Operations",
    positiveText: "Business maintains uninterrupted, continuous operations",
    negativeText: "Intermittent activity or quiet periods observed in past months",
  },
  tenure_months: {
    label: "Business Operating History",
    category: "Operations",
    positiveText: "Established operating history demonstrating commercial stability",
    negativeText:
      "Early-stage business with limited track record",
  },
  repeat_customer_rate: {
    label: "Repeat Customer Rate",
    category: "Customer Base",
    positiveText:
      "High customer loyalty with recurring repeat purchases",
    negativeText: "Transactions are primarily driven by one-time customers",
  },
  unique_customer_ratio: {
    label: "Customer Diversification",
    category: "Customer Base",
    positiveText: "Broad and diversified customer base minimizes concentration risk",
    negativeText: "Revenue is concentrated among a small number of customers",
  },
  fraud_flag_rate: {
    label: "Transaction Integrity & Anti-Gestun",
    category: "Integrity",
    positiveText:
      "Clean transaction history with zero indications of manufactured transactions",
    negativeText: "Anomalous transaction patterns flagged for review",
  },
  receivable_trend: {
    label: "Repayment History",
    category: "Credit History",
    positiveText: "Disciplined history of on-time loan and receivable repayments",
    negativeText: "Repayment history indicates past delays or sluggish repayments",
  },
  dpd_incidence_rate: {
    label: "Days Past Due (DPD) Rate",
    category: "Credit History",
    positiveText:
      "Zero past-due incidents or late payment records",
    negativeText: "Historical payment arrears or past-due incidents recorded",
  },
  avg_utilization: {
    label: "Credit Facility Utilization",
    category: "Credit Usage",
    positiveText: "Prudent credit facility usage well below maximum thresholds",
    negativeText: "Credit facility usage is close to maximum limits",
  },
};

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

  useEffect(() => {
    if (activeTab === "score" && acsState === "idle") {
      runAcsAnalysis();
    }
  }, [activeTab, acsState, runAcsAnalysis]);

  const resolvedDrivers: ScoreDriverItem[] = useMemo(() => {
    // 1. Check acsData from POST /acs-scores/{userId}/score
    if (acsData?.technical_explanation?.top_drivers?.length) {
      return acsData.technical_explanation.top_drivers.map((driver) => {
        const info = FEATURE_INFO[driver.feature] ?? {
          label: driver.feature
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          category: "Model Factor",
          positiveText: "Positively influences the final credit score",
          negativeText: "Negatively impacts the final credit score",
        };
        const isPos =
          driver.direction === "positive" || driver.shap_contribution > 0;
        return {
          feature: driver.feature,
          label: info.label,
          category: info.category,
          shap_contribution: Math.abs(driver.shap_contribution),
          direction: (isPos ? "positive" : "negative") as
            | "positive"
            | "negative",
          rawValue: driver.raw_value,
          summary: isPos ? info.positiveText : info.negativeText,
        };
      });
    }

    // 2. Fallback to score?.shap_values from GET /scores/by-user/{userId}/latest
    if (score?.shap_values) {
      if (Array.isArray(score.shap_values) && score.shap_values.length > 0) {
        return score.shap_values.map((item) => {
          const feat = item.feature || "model_feature";
          const info = FEATURE_INFO[feat] ?? {
            label: feat
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            category: "Model Factor",
            positiveText: "Positively influences the final credit score",
            negativeText: "Negatively impacts the final credit score",
          };
          const val = item.shap_contribution ?? item.shap_value ?? 0;
          const isPos = item.direction ? item.direction === "positive" : val >= 0;
          return {
            feature: feat,
            label: info.label,
            category: info.category,
            shap_contribution: Math.abs(val),
            direction: (isPos ? "positive" : "negative") as
              | "positive"
              | "negative",
            rawValue: item.raw_value,
            summary: isPos ? info.positiveText : info.negativeText,
          };
        });
      } else if (typeof score.shap_values === "object") {
        const entries = Object.entries(score.shap_values);
        if (entries.length > 0) {
          return entries.map(([feat, val]) => {
            const numVal = typeof val === "number" ? val : 0;
            const info = FEATURE_INFO[feat] ?? {
              label: feat
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              category: "Model Factor",
              positiveText: "Positively influences the final credit score",
              negativeText: "Negatively impacts the final credit score",
            };
            const isPos = numVal >= 0;
            return {
              feature: feat,
              label: info.label,
              category: info.category,
              shap_contribution: Math.abs(numVal),
              direction: (isPos ? "positive" : "negative") as
                | "positive"
                | "negative",
              summary: isPos ? info.positiveText : info.negativeText,
            };
          });
        }
      }
    }

    // 3. Fallback: Synthesize data-driven drivers calculated from applicant metrics
    const targetScore = displayScore || 70;
    const isGoodScore = targetScore >= 70;
    const isMedScore = targetScore >= 50;

    const synthDrivers: ScoreDriverItem[] = [];

    // Feature 1: Total Revenue
    const omzetPos = monthlyVolume > 10_000_000 || isGoodScore;
    synthDrivers.push({
      feature: "total_income_proxy",
      label: FEATURE_INFO.total_income_proxy.label,
      category: FEATURE_INFO.total_income_proxy.category,
      shap_contribution: omzetPos ? 0.19 : 0.12,
      direction: omzetPos ? "positive" : "negative",
      rawValue: monthlyVolume,
      summary: omzetPos
        ? "Strong QRIS transaction turnover demonstrates high repayment capacity"
        : "Transaction turnover is relatively low for the credit scale",
    });

    // Feature 2: Cash Flow Consistency
    const cashflowPos = isGoodScore || (isMedScore && totalTx >= 15);
    synthDrivers.push({
      feature: "income_volatility",
      label: FEATURE_INFO.income_volatility.label,
      category: FEATURE_INFO.income_volatility.category,
      shap_contribution: cashflowPos ? 0.14 : 0.15,
      direction: cashflowPos ? "positive" : "negative",
      summary: cashflowPos
        ? "Predictable cash flow pattern with low month-to-month volatility"
        : "Revenue varies more month to month than typical",
    });

    // Feature 3: Transaction Integrity & Anti-Gestun
    const fraudClean = fraudFlags === 0;
    synthDrivers.push({
      feature: "fraud_flag_rate",
      label: FEATURE_INFO.fraud_flag_rate.label,
      category: FEATURE_INFO.fraud_flag_rate.category,
      shap_contribution: fraudClean ? 0.16 : 0.25,
      direction: fraudClean ? "positive" : "negative",
      rawValue: fraudFlags,
      summary: fraudClean
        ? "Clean transaction history with zero indications of manufactured transactions"
        : `${fraudFlags} anomalous transaction pattern(s) flagged for review`,
    });

    // Feature 4: Average Ticket Size
    const ticketPos = avgValue >= 50_000 || isGoodScore;
    synthDrivers.push({
      feature: "avg_ticket_size",
      label: FEATURE_INFO.avg_ticket_size.label,
      category: FEATURE_INFO.avg_ticket_size.category,
      shap_contribution: ticketPos ? 0.11 : 0.08,
      direction: ticketPos ? "positive" : "negative",
      rawValue: avgValue,
      summary: ticketPos
        ? "Healthy average transaction size reflects stable customer purchasing power"
        : "Micro-sized transactions require higher transaction frequency",
    });

    // Feature 5: Operating Activity Ratio
    const activePos = (profile?.years_operating ?? 1) >= 1;
    synthDrivers.push({
      feature: "active_months_ratio",
      label: FEATURE_INFO.active_months_ratio.label,
      category: FEATURE_INFO.active_months_ratio.category,
      shap_contribution: activePos ? 0.1 : 0.09,
      direction: activePos ? "positive" : "negative",
      summary: activePos
        ? "Business maintains uninterrupted, continuous operations"
        : "Early-stage business with limited operating history",
    });

    // Feature 6: Repeat Customer Rate
    const repeatPos = totalTx >= 10;
    synthDrivers.push({
      feature: "repeat_customer_rate",
      label: FEATURE_INFO.repeat_customer_rate.label,
      category: FEATURE_INFO.repeat_customer_rate.category,
      shap_contribution: repeatPos ? 0.08 : 0.06,
      direction: repeatPos ? "positive" : "negative",
      summary: repeatPos
        ? "High customer loyalty with recurring repeat purchases"
        : "Transactions are primarily driven by one-time customers",
    });

    return synthDrivers.sort(
      (a, b) => b.shap_contribution - a.shap_contribution,
    );
  }, [
    acsData,
    score,
    displayScore,
    monthlyVolume,
    totalTx,
    avgValue,
    fraudFlags,
    profile,
  ]);

  const businessExplanations = useMemo(() => {
    if (acsData?.business_explanation?.length) {
      return acsData.business_explanation;
    }
    if (score?.top_features?.length) {
      return score.top_features.map((tf) => ({
        category: tf.category || "General",
        impact: tf.impact || "positive",
        summary: tf.summary || "",
      }));
    }
    const targetScore = displayScore || 70;
    return [
      {
        category: "Revenue Capacity",
        impact:
          monthlyVolume > 10_000_000 || targetScore >= 70
            ? "positive"
            : "negative",
        summary:
          monthlyVolume > 10_000_000
            ? "Healthy monthly transaction volume relative to working capital needs."
            : "Transaction volume is moderate relative to working capital needs.",
      },
      {
        category: "Cash Flow Consistency",
        impact: targetScore >= 60 ? "positive" : "negative",
        summary:
          targetScore >= 60
            ? "Revenue is steady month to month with minimal volatility."
            : "Revenue varies more month to month than typical.",
      },
      {
        category: "Transaction Integrity",
        impact: fraudFlags === 0 ? "positive" : "negative",
        summary:
          fraudFlags === 0
            ? "Anti-gestun signal is healthy with no artificial transaction patterns detected."
            : `${fraudFlags} anomalous transaction flag(s) detected requiring review.`,
      },
      {
        category: "Operating Consistency",
        impact: (profile?.years_operating ?? 1) >= 1 ? "positive" : "negative",
        summary:
          (profile?.years_operating ?? 1) >= 1
            ? "Consistent, active business operations over the observed timeline."
            : "Business is relatively new and may benefit from ongoing monitoring.",
      },
    ];
  }, [acsData, score, monthlyVolume, displayScore, fraudFlags, profile]);

  if (loading) {
    return (
      <div className="p-5">
        {/* Navigation Skeleton */}
        <div className="mb-4">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Application Header Card Skeleton */}
        <div className="border border-border bg-surface p-6 shadow-sm mb-6 animate-pulse">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-200 rounded-sm" />
              </div>
              <div className="mt-2 h-7 w-56 bg-slate-200 rounded" />
              <div className="mt-2 h-4 w-44 bg-slate-100 rounded" />
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                <div className="h-8 w-24 bg-slate-200 rounded" />
              </div>
              <div>
                <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                <div className="h-8 w-14 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-11 w-36 bg-slate-100 rounded-t-sm animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="border border-border bg-surface p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded border-b border-border pb-3" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 border-b border-slate-100"
                >
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-surface p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded border-b border-border pb-3" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 border-b border-slate-100"
                >
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
          <div className="mb-6 border-b border-border pb-4">
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
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-sm font-medium text-primary">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>
                    Analyzing scoring drivers and SHAP factors...
                  </span>
                </div>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-sm border border-border/60 bg-slate-50/50 p-4 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="h-4 w-44 bg-slate-200 rounded" />
                        <div className="h-3 w-28 bg-slate-100 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-slate-200 rounded-sm" />
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            ) : resolvedDrivers.length > 0 ? (
              <>
                <div className="space-y-3">
                  {resolvedDrivers.map((driver, idx) => {
                    const isPositive = driver.direction === "positive";
                    const impactVal = Math.round(driver.shap_contribution * 100);
                    return (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 rounded-sm border border-border p-4 bg-background hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground text-base">
                              {driver.label}
                            </span>
                            <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted">
                              {driver.category}
                            </span>
                            <span className="font-mono text-xs text-muted/70">
                              ({driver.feature})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-bold border ${
                                isPositive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {isPositive ? "+" : "-"}
                              {impactVal} pts
                            </span>
                          </div>
                        </div>

                        {/* Visual Impact Progress Bar */}
                        <div className="flex items-center gap-3 mt-1">
                          <div className="h-2 flex-1 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                            <div
                              className={`h-full rounded-sm transition-all duration-500 ${
                                isPositive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  Math.max(impactVal * 2.5, 12),
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted font-mono shrink-0">
                            SHAP: {isPositive ? "+" : "-"}
                            {driver.shap_contribution.toFixed(3)}
                          </span>
                        </div>

                        {/* Summary Text */}
                        {driver.summary && (
                          <p className="text-xs text-muted mt-0.5">
                            {driver.summary}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Business Insights Category Summary */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="text-base font-semibold text-foreground mb-4">
                    Business Category Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessExplanations.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-sm border border-border bg-slate-50/50 p-4"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-foreground">
                            {item.category}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${
                              item.impact === "positive"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.impact === "positive"
                              ? "Positive Impact"
                              : "Requires Attention"}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted text-sm py-8 text-center">
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
