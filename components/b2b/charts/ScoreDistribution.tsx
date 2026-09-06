"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ChartBar } from "@phosphor-icons/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
);

interface ScoreDistributionProps {
  counts: number[];
}

export default function ScoreDistribution({ counts }: ScoreDistributionProps) {
  const data = {
    labels: ["0–50", "51–70", "71–80", "81–90", "91–100"],

    datasets: [
      {
        label: "Applications",
        data: counts,

        backgroundColor: "#18B5BA",
        borderColor: "#18B5BA",

        borderWidth: 1,

        borderRadius: 2,

        barPercentage: 0.65,
        categoryPercentage: 0.75,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,

        labels: {
          usePointStyle: true,
          pointStyle: "rect",
          boxWidth: 8,
          padding: 20,
        },
      },

      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#6b7280",
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#e5e7eb",
        },

        ticks: {
          color: "#6b7280",
        },
      },
    },
  };

  return (
    <div className="border border-border bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ChartBar size={22} weight="fill" className="text-foreground/90" />

          <h2 className="text-xl font-semibold text-foreground/90">
            Score Distribution
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
