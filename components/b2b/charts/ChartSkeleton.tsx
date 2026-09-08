export default function ChartSkeleton({ title }: { title?: string }) {
  return (
    <div className="border border-border bg-surface p-6 shadow-sm animate-pulse">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-slate-200" />
        {title ? (
          <h2 className="text-xl font-semibold text-foreground/50">{title}</h2>
        ) : (
          <div className="h-6 w-40 rounded bg-slate-200" />
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="h-80 w-full rounded-sm bg-slate-50 flex items-end justify-between p-6 gap-4 border border-dashed border-slate-200">
        <div className="w-1/6 bg-slate-200/80 rounded-t h-2/5 transition-all duration-500" />
        <div className="w-1/6 bg-slate-200/80 rounded-t h-3/5 transition-all duration-500" />
        <div className="w-1/6 bg-slate-200/80 rounded-t h-4/5 transition-all duration-500" />
        <div className="w-1/6 bg-slate-200/80 rounded-t h-3/5 transition-all duration-500" />
        <div className="w-1/6 bg-slate-200/80 rounded-t h-1/2 transition-all duration-500" />
      </div>
    </div>
  );
}
