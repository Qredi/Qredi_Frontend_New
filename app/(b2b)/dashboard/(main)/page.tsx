"use client";

import Link from "next/link";
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
import { MOCK_APPLICATIONS } from "@/data/mockApplications";

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

export default function DashboardPage() {
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
        <ApplicationTrend />
        <ScoreDistribution />
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

        <ApplicationsTable data={MOCK_APPLICATIONS} limit={5} />
      </div>
    </div>
  );
}
