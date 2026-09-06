"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
import { applicationsStore } from "@/lib/applications-store";
import {
  enrichWithFraudRisk,
  loadBackendApplications,
  loadMerchantPipeline,
  localApplicationToRow,
  mergeApplications,
  type Application,
} from "@/lib/applications";

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

/**
 * Tren pengajuan per bulan.
 *
 * Memakai `submittedAt` dari pengajuan — `ScoreOut` maupun `MatchOut` di
 * backend tidak mengirim timestamp, jadi skor tidak bisa dipakai sebagai
 * sumbu waktu.
 */
function getMonthlyTrend(apps: Application[]): {
  labels: string[];
  data: number[];
} {
  const monthCounts = new Map<string, number>();

  for (const app of apps) {
    if (!app.submittedAt) continue;
    const d = new Date(app.submittedAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }

  const sortedKeys = [...monthCounts.keys()].sort();
  return {
    labels: sortedKeys.map((k) => MONTH_NAMES[Number(k.split("-")[1])]),
    data: sortedKeys.map((k) => monthCounts.get(k) ?? 0),
  };
}

export default function DashboardPage() {
  const [pipeline, setPipeline] = useState<Application[]>([]);
  const [backendApplications, setBackendApplications] = useState<Application[]>(
    [],
  );

  const localApplications = useSyncExternalStore(
    applicationsStore.subscribe,
    applicationsStore.getSnapshot,
    applicationsStore.getServerSnapshot,
  );

  useEffect(() => {
    async function load() {
      const [merchants, applications] = await Promise.all([
        loadMerchantPipeline(),
        loadBackendApplications(),
      ]);
      setPipeline(merchants);
      setBackendApplications(applications);

      // Pass kedua: Fraud Risk butuh satu request transaksi per merchant.
      setPipeline(await enrichWithFraudRisk(merchants));
    }
    load();
  }, []);

  const applications = useMemo(() => {
    const backendIds = new Set(backendApplications.map((a) => a.id));
    const local = localApplications
      .filter((a) => !backendIds.has(a.id))
      .map(localApplicationToRow);
    return [...backendApplications, ...local];
  }, [backendApplications, localApplications]);

  const rows = useMemo(
    () => mergeApplications(pipeline, applications),
    [pipeline, applications],
  );

  const kpis = useMemo(() => {
    const scored = pipeline.filter((a) => a.score != null || a.creditScore > 0);
    const averageScore =
      scored.length > 0
        ? scored.reduce((sum, a) => sum + a.creditScore, 0) / scored.length
        : 0;
    const highRisk = scored.filter((a) => a.riskLevel === "High").length;

    return [
      {
        label: "Total Applications",
        value: applications.length.toLocaleString("en-US"),
        icon: ClipboardText,
      },
      {
        label: "Average Score",
        value: averageScore ? averageScore.toFixed(1) : "-",
        icon: ChartLineUp,
      },
      {
        label: "High Risk",
        value: highRisk.toLocaleString("en-US"),
        icon: Warning,
      },
      {
        label: "Merchants Scored",
        value: scored.length.toLocaleString("en-US"),
        icon: CheckCircle,
      },
    ];
  }, [pipeline, applications]);

  const trend = useMemo(() => getMonthlyTrend(applications), [applications]);
  const buckets = useMemo(
    () => getDistributionBuckets(pipeline.filter((a) => a.creditScore > 0)),
    [pipeline],
  );

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
        <ApplicationTrend labels={trend.labels} data={trend.data} />
        <ScoreDistribution counts={buckets} />
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

        <ApplicationsTable data={rows} limit={5} />
      </div>
    </div>
  );
}
