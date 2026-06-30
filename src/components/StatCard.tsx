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
  accent?: string;
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendLabel,
  accent,
  highlight,
}: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="rounded-[18px] p-5 flex flex-col gap-3 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: "var(--bg-card)",
        boxShadow: highlight
          ? "var(--nm-raised), 0 0 0 1.5px var(--accent-dim-border)"
          : "var(--nm-raised)",
        border: highlight
          ? "1px solid var(--accent-dim-border)"
          : "1px solid var(--border)",
      }}
    >
      {/* Top row: icon + label */}
      <div className="flex items-start justify-between">
        <p className="label-caps">{label}</p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: accent ?? "var(--accent-gradient)",
              boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
            }}
          >
            <Icon className="w-4 h-4" style={{ color: "#fff" }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className="stat-number"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>

      {/* Trend + sub */}
      <div className="flex items-center gap-2 mt-auto">
        {trend !== undefined && (
          <span
            className="flex items-center gap-0.5 text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full"
            style={{
              color: trendPositive ? "var(--green)" : "var(--red)",
              background: trendPositive
                ? "rgba(16,185,129,0.10)"
                : "rgba(239,68,68,0.10)",
            }}
          >
            {trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
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
