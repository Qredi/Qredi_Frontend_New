import { Icon } from "@phosphor-icons/react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: Icon;
}

export default function KpiCard({
  label,
  value,
  icon: IconComponent,
}: KpiCardProps) {
  return (
    <div className="relative border border-border bg-slate-50 p-6">
      {/* Icon */}
      <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-md bg-primary/5 text-primary">
        <IconComponent size={22} weight="regular" />
      </div>

      {/* Content */}
      <div className="pr-14">
        <p className="text-base font-medium text-muted">{label}</p>

        <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="relative border border-border bg-slate-50 p-6 animate-pulse">
      <div className="absolute right-5 top-5 h-10 w-10 rounded-md bg-slate-200" />
      <div className="pr-14">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-6 h-8 w-20 rounded bg-slate-200" />
      </div>
    </div>
  );
}
