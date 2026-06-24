import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number;
  trendLabel?: string;
}

export function StatCard({ label, value, sub, trend, trendLabel }: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div
      className="rounded-xl p-5 transition-shadow hover:shadow-sm flex flex-col gap-3"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Label */}
      <p className="label-caps">{label}</p>

      {/* Value */}
      <p className="stat-number">{value}</p>

      {/* Trend + sub */}
      <div className="flex items-center gap-2 mt-auto">
        {trend !== undefined && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold tabular-nums"
            style={{ color: trendPositive ? "#10b981" : "#ef4444" }}
          >
            {trendPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {(sub || trendLabel) && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {trendLabel ?? sub}
          </p>
        )}
      </div>
    </div>
  );
}
