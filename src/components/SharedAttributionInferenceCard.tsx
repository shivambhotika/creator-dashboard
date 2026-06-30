"use client";

import type { AttributionGroup } from "@/types";
import type { InferredAttribution } from "@/types";

interface SharedAttributionInferenceCardProps {
  group: AttributionGroup;
  inferredAttributions: InferredAttribution[];
  creatorTotalLeads: number | null;
  creatorTotalClicks: number | null;
  lastComputedAt: string | null;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  exact: "EXACT",
  high_estimated: "HIGH (EST.)",
  medium_estimated: "MEDIUM (EST.)",
  low_estimated: "LOW (EST.)",
  unassigned: "UNASSIGNED",
};

function fmt(dt: string | null): string {
  if (!dt) return "not yet computed";
  try {
    return new Date(dt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  } catch {
    return dt;
  }
}

export function SharedAttributionInferenceCard({
  group,
  inferredAttributions,
  creatorTotalLeads,
  creatorTotalClicks,
  lastComputedAt,
}: SharedAttributionInferenceCardProps) {
  const byVideo = new Map(inferredAttributions.map((a) => [a.videoId, a]));

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {group.name}
        </h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #f59e0b55" }}
        >
          ESTIMATED — not exact
        </span>
      </div>

      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        Slugs: {group.dubSlugs.join(", ") || "—"} · {group.videoIds.length} videos · creator-level attribution only
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg p-2" style={{ background: "var(--bg-surface)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Creator installs (exact)</p>
          <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {creatorTotalLeads != null ? creatorTotalLeads.toLocaleString("en-IN") : "—"}
          </p>
        </div>
        <div className="rounded-lg p-2" style={{ background: "var(--bg-surface)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Creator clicks (exact)</p>
          <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {creatorTotalClicks != null ? creatorTotalClicks.toLocaleString("en-IN") : "—"}
          </p>
        </div>
      </div>

      <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
        Per-video estimated split:
      </p>
      <div className="space-y-1.5">
        {group.videoIds.map((vid) => {
          const inf = byVideo.get(vid);
          return (
            <div
              key={vid}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
              style={{ background: "var(--bg-surface)" }}
            >
              <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>{vid}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {inf ? `${(inf.probability * 100).toFixed(0)}% · ~${Math.round(inf.allocatedValue).toLocaleString("en-IN")} installs` : "—"}
                </span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "#fffbeb", color: "#b45309" }}
                >
                  {inf ? CONFIDENCE_LABEL[inf.confidence] ?? inf.confidence : "EST."}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
        Last computed: {fmt(lastComputedAt)}. Video-level numbers are inferred from time-window and view-velocity
        scoring — treat as directional, not billable.
      </p>
    </div>
  );
}

export default SharedAttributionInferenceCard;
