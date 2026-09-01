"use client";

import { useState } from "react";
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
import { MOCK_APPLICATIONS } from "@/data/mockApplications";

// Mock data detail tambahan untuk Application Detail
const MOCK_DETAIL_DATA = {
  submittedTimestamp: "24 Aug 2026, 14:32 WIB",
  defaultProbability: "3.8%",
  // Overview Data
  businessProfile: {
    name: "Kedai Nusantara",
    category: "Food & Beverage",
    qrisActiveSince: "12 Oct 2022",
    businessDuration: "3 Years 10 Months",
    location: "Jakarta Selatan, DKI Jakarta",
  },
  transactionSummary: {
    totalTransactions: "1,284",
    avgDailyTransactions: "42 tx / day",
    avgTransactionValue: "Rp 87.500",
    monthlyVolume: "Rp 112.350.000",
    monthlyRevenue: "Rp 112.350.000",
  },
  // Score Factors (SHAP Explanation)
  shapFactors: [
    { factor: "Transaction Consistency", impact: "+18", isPositive: true },
    { factor: "Revenue Growth Trend", impact: "+14", isPositive: true },
    { factor: "QRIS Active Duration", impact: "+10", isPositive: true },
    { factor: "Daily Revenue Stability", impact: "+8", isPositive: true },
    { factor: "Transaction Volatility", impact: "-5", isPositive: false },
  ],
  // Fraud / Anti-Gestun Indicators
  fraudIndicators: [
    { label: "Transaction Pattern", status: "Normal", isAnomaly: false },
    { label: "Transaction Frequency", status: "Normal", isAnomaly: false },
    { label: "Transaction Amount Pattern", status: "Normal", isAnomaly: false },
    { label: "Suspicious Activity", status: "None Detected", isAnomaly: false },
  ],
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = params?.id as string;
  const [activeTab, setActiveTab] = useState<
    "overview" | "score" | "fraud" | "business"
  >("overview");

  // Ambil data dasar dari mock list
  const baseApp = MOCK_APPLICATIONS.find((app) => app.id === appId) || {
    id: appId || "QRD-00124",
    merchantName: "Kedai Nusantara",
    businessType: "Food & Beverage",
    creditScore: 86,
    riskLevel: "Low",
    fraudRisk: "Low",
    requestedAmount: "Rp 50.000.000",
    submittedAt: "2 minutes ago",
  };

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
                {baseApp.id}
              </span>
              <span
                className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${getRiskBadge(
                  baseApp.riskLevel,
                )}`}
              >
                {baseApp.riskLevel} Risk
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-foreground py-2">
              {baseApp.merchantName}
            </h1>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted">
              <span>{baseApp.businessType}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Submitted {MOCK_DETAIL_DATA.submittedTimestamp}
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
                  {baseApp.creditScore}
                </span>
                <span className="text-sm font-medium text-muted">/ 100</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Default Prob.
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {MOCK_DETAIL_DATA.defaultProbability}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 border-b-2 py-3 px-5 text-base font-medium transition-colors ${
              activeTab === "overview"
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            <Storefront size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("score")}
            className={`flex items-center gap-2 border-b-2 py-3 px-5 text-base font-medium transition-colors ${
              activeTab === "score"
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            <TrendUp size={18} />
            Score Analysis
          </button>
          <button
            onClick={() => setActiveTab("fraud")}
            className={`flex items-center gap-2 border-b-2 py-3 px-5 text-base font-medium transition-colors ${
              activeTab === "fraud"
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            <ShieldWarning size={18} />
            Fraud Risk
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-2 border-b-2 py-3 px-5 text-base font-medium transition-colors ${
              activeTab === "business"
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            <Database size={18} />
            Business Data
          </button>
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
                  {MOCK_DETAIL_DATA.businessProfile.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Business Category</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.businessProfile.category}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Location</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.businessProfile.location}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">QRIS Active Since</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.businessProfile.qrisActiveSince}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Business Duration</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.businessProfile.businessDuration}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">
              Transaction Summary (QRIS)
            </h3>
            <div className="space-y-4 text-base">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Total Transactions</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.transactionSummary.totalTransactions}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Avg. Daily Transactions</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.transactionSummary.avgDailyTransactions}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Avg. Transaction Value</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.transactionSummary.avgTransactionValue}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-muted">Monthly Volume</span>
                <span className="font-medium text-foreground">
                  {MOCK_DETAIL_DATA.transactionSummary.monthlyVolume}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Requested Amount</span>
                <span className="font-semibold text-primary">
                  {baseApp.requestedAmount}
                </span>
              </div>
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
              credit score of {baseApp.creditScore}/100.
            </p>
          </div>

          <div className="space-y-4">
            {MOCK_DETAIL_DATA.shapFactors.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 text-base">
                {/* 1. Label Factor */}
                <span className="w-52 shrink-0 font-medium text-foreground">
                  {item.factor}
                </span>

                {/* 2. Impact Value */}
                <span
                  className={`w-10 text-right font-semibold shrink-0 ${
                    item.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {item.impact}
                </span>

                {/* 3. Bar Visualizer */}
                <div className="h-2 flex-1 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-sm transition-all duration-300 ${
                      item.isPositive ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.abs(parseInt(item.impact)) * 4,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
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
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle size={14} weight="fill" />
                Healthy
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MOCK_DETAIL_DATA.fraudIndicators.map((ind, idx) => (
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
                  <span>Daily Revenue Volatility:</span>
                  <span className="text-foreground font-medium">
                    0.12 (Low)
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Growth Rate (MoM):</span>
                  <span className="text-foreground font-medium">+12.4%</span>
                </li>
                <li className="flex justify-between">
                  <span>Transaction Frequency:</span>
                  <span className="text-foreground font-medium">
                    Consistent
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
                  <span>Merchant Category Code (MCC):</span>
                  <span className="text-foreground font-medium">5812</span>
                </li>
                <li className="flex justify-between">
                  <span>QRIS Age:</span>
                  <span className="text-foreground font-medium">46 Months</span>
                </li>
                <li className="flex justify-between">
                  <span>Peak Hours Consistency:</span>
                  <span className="text-foreground font-medium">High</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
