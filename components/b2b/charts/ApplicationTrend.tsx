"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChartBar } from "@phosphor-icons/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
);

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

  datasets: [
    {
      label: "Applications",
      data: [180, 240, 215, 290, 340, 380],

      borderColor: "#e5002b",
      backgroundColor: "#e5002b",

      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,

      tension: 0,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: "index" as const,
    intersect: false,
  },

  plugins: {
    legend: {
      display: true,
      position: "bottom" as const,

      labels: {
        usePointStyle: true,
        pointStyle: "circle",
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

export default function ApplicationTrend() {
  return (
    <div className="border border-border bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ChartBar size={22} weight="fill" className="text-foreground/90" />

          <h2 className="text-xl font-semibold text-foreground/90">
            Application Trend
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
