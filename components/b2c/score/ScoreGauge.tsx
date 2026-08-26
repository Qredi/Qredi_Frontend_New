"use client";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  statusText: string;
}

export default function ScoreGauge({
  score,
  maxScore = 100,
  statusText,
}: ScoreGaugeProps) {
  const clampedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = clampedScore / maxScore;

  const getScoreColor = (val: number) => {
    const normalized = (val / maxScore) * 100;

    if (normalized < 50) {
      return {
        color: "text-rose-500",
        ring: "text-rose-500",
      };
    }

    if (normalized < 70) {
      return {
        color: "text-amber-500",
        ring: "text-amber-500",
      };
    }

    if (normalized < 85) {
      return {
        color: "text-emerald-500",
        ring: "text-emerald-500",
      };
    }

    return {
      color: "text-emerald-600",
      ring: "text-emerald-600",
    };
  };

  const theme = getScoreColor(clampedScore);

  /*
   * Gauge dimensions
   *
   * centerY       → posisi referensi text
   * arcCenterY    → posisi arc + indicator
   *
   * Dengan arcCenterY lebih kecil dari centerY,
   * gauge akan terdorong ke atas tanpa mengubah posisi text.
   */
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  // Hanya arc yang dinaikkan
  const arcCenterY = 92;

  const angle = 180 - percentage * 180;
  const angleRad = (angle * Math.PI) / 180;

  // Indicator mengikuti posisi arc
  const indicatorX = centerX + radius * Math.cos(angleRad);

  const indicatorY = arcCenterY - radius * Math.sin(angleRad);

  const arcPath = `
    M ${centerX - radius} ${arcCenterY}
    A ${radius} ${radius} 0 0 1 ${centerX + radius} ${arcCenterY}
  `;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Gauge Container */}
      <div className="relative h-44 w-80">
        <svg
          viewBox="0 0 200 110"
          className="h-full w-full overflow-visible"
          aria-label={`Score ${clampedScore} out of ${maxScore}`}
        >
          {/* Background Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-slate-200"
          />

          {/* Progress Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${percentage * 100} 100`}
            className={`${theme.color} transition-all duration-1000 ease-out`}
          />

          {/* Indicator */}
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r="7"
            fill="white"
            stroke="currentColor"
            strokeWidth="3"
            className={`${theme.ring} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Score + Status — posisi tetap */}
        <div className="absolute inset-x-0 bottom-3 flex flex-col items-center">
          <span className="text-6xl font-semibold tracking-tight text-foreground">
            {clampedScore}
          </span>

          <span
            className={`mt-2 text-[17px] font-semibold uppercase tracking-[0.2em] ${theme.color}`}
          >
            {statusText}
          </span>
        </div>

        {/* Scale — posisi tetap */}
        <span className="absolute bottom-0 left-7 text-sm font-medium text-slate-400">
          0
        </span>

        <span className="absolute bottom-0 right-5 text-sm font-medium text-slate-400">
          {maxScore}
        </span>
      </div>
    </div>
  );
}
