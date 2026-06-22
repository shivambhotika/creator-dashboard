import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: number; // positive = good, negative = bad, undefined = no trend
  trendLabel?: string;
}

export function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg, trend, trendLabel }: StatCardProps) {
  return (
    <div className="rounded-xl border p-5 transition-shadow hover:shadow-md"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
        <div className={`${iconBg} p-2 rounded-lg shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {sub && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </div>
  );
}
