"use client";

import { useState, useMemo, useEffect } from "react";
import { MagnifyingGlass, Funnel, Rows } from "@phosphor-icons/react";
import ApplicationsTable from "@/components/b2b/tables/ApplicationsTable";
import { apiFetch } from "@/lib/api";
import type { UserOut, ScoreOut } from "@/lib/types";
import {
  type Application,
  riskToCap,
} from "@/lib/applications";

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [fraudFilter, setFraudFilter] = useState<string>("All");
  const [scoreFilter, setScoreFilter] = useState<string>("All");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const users = await apiFetch<UserOut[]>("/users/?role=umkm&limit=50");
        const apps: Application[] = await Promise.all(
          users.slice(0, 50).map(async (u) => {
            let score: ScoreOut | null = null;
            try {
              score = await apiFetch<ScoreOut>(
                `/scores/by-user/${u.id}/latest`,
              );
            } catch {
              // no score
            }

            const displayScore = score ? score.acs_score : 0;

            return {
              id: u.id,
              merchantName: u.full_name,
              businessType: "UMKM",
              creditScore: displayScore,
              riskLevel: riskToCap(score?.risk_level ?? "medium"),
              fraudRisk: "Low" as const,
              requestedAmount: "Rp 50.000.000",
              submittedAt: "",
              userId: u.id,
              profile: null,
              score,
            };
          }),
        );
        setApplications(apps);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.businessType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = riskFilter === "All" || item.riskLevel === riskFilter;

      const matchesFraud =
        fraudFilter === "All" || item.fraudRisk === fraudFilter;

      let matchesScore = true;
      if (scoreFilter === "0-50") matchesScore = item.creditScore <= 50;
      else if (scoreFilter === "51-70")
        matchesScore = item.creditScore >= 51 && item.creditScore <= 70;
      else if (scoreFilter === "71-80")
        matchesScore = item.creditScore >= 71 && item.creditScore <= 80;
      else if (scoreFilter === "81-90")
        matchesScore = item.creditScore >= 81 && item.creditScore <= 90;
      else if (scoreFilter === "91-100") matchesScore = item.creditScore >= 91;

      return matchesSearch && matchesRisk && matchesFraud && matchesScore;
    });
  }, [applications, searchQuery, riskFilter, fraudFilter, scoreFilter]);

  return (
    <div className="p-5">
      {/* Page Title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium text-foreground">
            Applications
          </h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="border border-border bg-surface p-6 shadow-sm">
        {/* Header Title */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Rows size={22} weight="bold" className="text-foreground/80" />
            <h2 className="text-xl font-semibold text-foreground/80">
              All Applications
            </h2>
            <span className="ml-2 rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted">
              {filteredApplications.length} items
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search Application ID, Merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <Funnel size={16} />
              <span>Filters:</span>
            </div>

            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="All">Risk Level: All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {/* Fraud Risk Filter */}
            <select
              value={fraudFilter}
              onChange={(e) => setFraudFilter(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="All">Fraud Risk: All</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="Elevated">Elevated</option>
            </select>

            {/* Score Range Filter */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="All">Score Range: All</option>
              <option value="0-50">0 – 50</option>
              <option value="51-70">51 – 70</option>
              <option value="71-80">71 – 80</option>
              <option value="81-90">81 – 90</option>
              <option value="91-100">91 – 100</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="py-12 text-center text-muted">Loading...</div>
        ) : filteredApplications.length > 0 ? (
          <ApplicationsTable data={filteredApplications} />
        ) : (
          <div className="py-12 text-center text-muted">
            No applications found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
