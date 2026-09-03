"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardText,
  ChartLineUp,
  Warning,
  CheckCircle,
  GridFour,
  ClockCounterClockwise,
  ArrowRight,
} from "@phosphor-icons/react";

import KpiCard from "@/components/b2b/ui/KpiCard";
import ApplicationTrend from "@/components/b2b/charts/ApplicationTrend";
import ScoreDistribution from "@/components/b2b/charts/ScoreDistribution";
import ApplicationsTable from "@/components/b2b/tables/ApplicationsTable";
import { apiFetch } from "@/lib/api";
import type { UserOut, ScoreOut } from "@/lib/types";
import {
  type Application,
  riskToCap,
} from "@/lib/applications";

const kpis = [
  {
    label: "Total Applications",
    value: "1,284",
    icon: ClipboardText,
  },
  {
    label: "Average Score",
    value: "76.4",
    icon: ChartLineUp,
  },
  {
    label: "High Risk",
    value: "124",
    icon: Warning,
  },
  {
    label: "Scored This Month",
    value: "342",
    icon: CheckCircle,
  },
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDistributionBuckets(apps: Application[]): number[] {
  const buckets = [0, 0, 0, 0, 0]; // 0-50, 51-70, 71-80, 81-90, 91-100
  for (const app of apps) {
    const s = app.creditScore;
    if (s <= 50) buckets[0]++;
    else if (s <= 70) buckets[1]++;
    else if (s <= 80) buckets[2]++;
    else if (s <= 90) buckets[3]++;
    else buckets[4]++;
  }
  return buckets;
}

function getMonthlyTrend(apps: Application[]): { labels: string[]; data: number[] } {
  const monthCounts = new Map<number, number>();
  for (const app of apps) {
    if (!app.score?.created_at) continue;
    const month = new Date(app.score.created_at).getMonth();
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  const sortedMonths = [...monthCounts.keys()].sort((a, b) => a - b);
  const labels = sortedMonths.map((m) => MONTH_NAMES[m]);
  const data = sortedMonths.map((m) => monthCounts.get(m) ?? 0);
  return { labels, data };
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const users = await apiFetch<UserOut[]>("/users/?role=umkm&limit=50");
        const apps: Application[] = await Promise.all(
          users.slice(0, 20).map(async (u) => {
            let score: ScoreOut | null = null;
            try {
              score = await apiFetch<ScoreOut>(
                `/scores/by-user/${u.id}/latest`,
              );
            } catch {
              // no score
            }

            const displayScore = score ? Math.round(score.acs_score) : 0;

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
      }
    }
    load();
  }, []);

  return (
    <div className="p-5">
      <div className="mb-4">
        <h1 className="text-[28px] font-medium text-foreground">Dashboard</h1>
      </div>

      {/* Overview */}
      <div className="flex flex-col gap-2 border border-border bg-surface p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <GridFour size={22} weight="fill" className="text-foreground/80" />

          <h2 className="text-xl font-semibold text-foreground/80">Overview</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ApplicationTrend
          labels={getMonthlyTrend(applications).labels}
          data={getMonthlyTrend(applications).data}
        />
        <ScoreDistribution counts={getDistributionBuckets(applications)} />
      </div>

      {/* Recent Applications Table */}
      <div className="mt-6 border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockCounterClockwise
              size={22}
              weight="bold"
              className="text-foreground/80"
            />
            <h2 className="text-xl font-semibold text-foreground/80">
              Recent Applications
            </h2>
          </div>

          <Link
            href="/dashboard/applications"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        <ApplicationsTable data={applications} limit={5} />
      </div>
    </div>
  );
}
