"use client";
import type { MetricSource, MetricConfidence, DataIssueSeverity } from "@/types";

const SOURCE_CFG: Record<MetricSource, { label: string; color: string }> = {
  dub:       { label: "Dub",      color: "#8b5cf6" },
  platform:  { label: "Platform", color: "#0a66c2" },
  agency:    { label: "Agency",   color: "#0891b2" },
  manual:    { label: "Manual",   color: "#d97706" },
  scrape:    { label: "Scraped",  color: "#059669" },
  estimated: { label: "Est.",     color: "#d97706" },
  mock:      { label: "Mock",     color: "#6b7280" },
  missing:   { label: "Missing",  color: "#ef4444" },
};

const CONF_CFG: Record<MetricConfidence, { label: string; color: string }> = {
  high:   { label: "High", color: "#10b981" },
  medium: { label: "Med",  color: "#f59e0b" },
  low:    { label: "Low",  color: "#ef4444" },
  none:   { label: "—",    color: "#6b7280" },
};

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ background: color + "22", color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

export function MetricProvenanceChip({ source }: { source: MetricSource }) {
  return <Chip {...SOURCE_CFG[source]} />;
}

export function ConfidenceBadge({ confidence }: { confidence: MetricConfidence }) {
  return <Chip {...CONF_CFG[confidence]} />;
}

export function AttributionBadge({ shared, level }: { shared?: boolean; level?: string }) {
  const color = shared ? "#d97706" : "#10b981";
  const label = shared ? "Shared" : (level === "creator" ? "Creator" : "Video");
  return <Chip label={label} color={color} />;
}

export function DataIssueBadge({ severity, count }: { severity: DataIssueSeverity; count?: number }) {
  const cfgs: Record<DataIssueSeverity, { label: string; color: string }> = {
    critical: { label: "Critical", color: "#ef4444" },
    warning:  { label: "Warn",     color: "#d97706" },
    info:     { label: "Info",     color: "#3b82f6" },
    resolved: { label: "OK",       color: "#10b981" },
  };
  const cfg = cfgs[severity];
  return <Chip label={count != null ? `${cfg.label} (${count})` : cfg.label} color={cfg.color} />;
}

export function EmptyMetric({ status }: {
  status?: "deleted" | "scheduled" | "not_shared" | "pending" | "unknown"
}) {
  const labels: Record<string, string> = {
    deleted: "Deleted", scheduled: "Scheduled",
    not_shared: "Not shared", pending: "Pending", unknown: "—",
  };
  return (
    <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>
      {labels[status ?? "unknown"] ?? "—"}
    </span>
  );
}
