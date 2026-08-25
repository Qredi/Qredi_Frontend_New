"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Application } from "@/data/mockApplications";

interface ApplicationsTableProps {
  data: Application[];
  limit?: number;
}

export default function ApplicationsTable({
  data,
  limit,
}: ApplicationsTableProps) {
  const displayData = limit ? data.slice(0, limit) : data;

  const getRiskBadge = (level: Application["riskLevel"]) => {
    switch (level) {
      case "Low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  const getFraudBadge = (level: Application["fraudRisk"]) => {
    switch (level) {
      case "Low":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Elevated":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-foreground">
        <thead className="border-b border-border bg-slate-50 text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3.5">Application ID</th>
            <th className="px-4 py-3.5">Merchant</th>
            <th className="px-4 py-3.5">Credit Score</th>
            <th className="px-4 py-3.5">Risk Level</th>
            <th className="px-4 py-3.5">Fraud Risk</th>
            <th className="px-4 py-3.5">Requested Amount</th>
            <th className="px-4 py-3.5">Submitted At</th>
            <th className="px-4 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {displayData.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-slate-50/60 transition-colors"
            >
              <td className="px-4 py-4 font-mono font-medium text-foreground">
                {item.id}
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-foreground">
                  {item.merchantName}
                </div>
                <div className="text-xs text-muted">{item.businessType}</div>
              </td>
              <td className="px-4 py-4">
                <span className="font-semibold text-foreground">
                  {item.creditScore}
                </span>
                <span className="text-xs text-muted"> / 100</span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${getRiskBadge(
                    item.riskLevel,
                  )}`}
                >
                  {item.riskLevel}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${getFraudBadge(
                    item.fraudRisk,
                  )}`}
                >
                  {item.fraudRisk}
                </span>
              </td>
              <td className="px-4 py-4 font-medium text-foreground">
                {item.requestedAmount}
              </td>
              <td className="px-4 py-4 text-muted">{item.submittedAt}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  href={`/dashboard/applications/${item.id}`}
                  className="inline-flex items-center gap-1 font-medium text-sky-600 hover:underline"
                >
                  View Detail
                  <ArrowRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
