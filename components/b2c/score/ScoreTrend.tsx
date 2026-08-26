"use client";

interface ScoreTrendItem {
  month: string;
  score: number;
}

interface ScoreTrendProps {
  scoreTrends: ScoreTrendItem[];
  diffPoin?: string;
}

export default function ScoreTrend({
  scoreTrends,
  diffPoin = "+8 Poin",
}: ScoreTrendProps) {
  return (
    <div className="border border-border bg-surface p-5 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Perkembangan Skor
          </h3>
          <p className="text-sm text-muted">Trend 5 bulan terakhir</p>
        </div>

        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
          {diffPoin}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 pt-6 pb-2 px-1">
        {scoreTrends.map((item, idx) => {
          const isLatest = idx === scoreTrends.length - 1;
          const heightPercent = Math.max(((item.score - 50) / 50) * 100, 20);

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <span
                className={`text-xs font-bold ${
                  isLatest ? "text-teal-500" : "text-muted"
                }`}
              >
                {item.score}
              </span>

              <div className="w-full bg-slate-100 rounded-t-md h-24 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isLatest ? "bg-teal-500" : "bg-slate-300"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              <span
                className={`text-xs font-medium ${
                  isLatest ? "text-foreground font-bold" : "text-muted"
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
