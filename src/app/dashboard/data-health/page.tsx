import { getAllDataIssues, calculateDataQualityScore } from "@/lib/data-quality";
import type { DataIssue } from "@/types";
import { getStorageStatus, getLatestMetricSnapshot, listSyncRuns } from "@/lib/storage";
import { videos } from "@/lib/mock-data";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { getDubStats } from "@/lib/dub-server";
import { buildDashboardIntelligence } from "@/lib/insights";

const STALE_MS = 48 * 60 * 60 * 1000;

async function buildDynamicIssues(): Promise<{
  issues: DataIssue[];
  storageLabel: string;
  storageDetail: string;
  storagePersistent: boolean;
  lastSyncSummary: string;
}> {
  const issues: DataIssue[] = [];
  const storage = await getStorageStatus();

  if (!storage.persistent) {
    issues.push({
      id: "dyn-snapshot-db-missing",
      entityType: "system", entityId: "storage",
      severity: "warning", issueType: "unknown_zero",
      title: "Snapshot storage is temporary",
      description: storage.detail,
      suggestedFix: "Set DATABASE_URL in production, or set SNAPSHOT_STORAGE_FILE for a writable local runtime.",
      owner: "Shivam", status: "open",
    });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    issues.push({
      id: "dyn-youtube-api-missing",
      entityType: "system", entityId: "youtube",
      severity: "warning", issueType: "stale_metrics",
      title: "YouTube API key not set",
      description: "YOUTUBE_API_KEY is missing. YouTube view/like/comment snapshots cannot be fetched.",
      suggestedFix: "Set YOUTUBE_API_KEY to enable YouTube snapshot sync.",
      owner: "Shivam", status: "open",
    });
  }

  // Stale-snapshot detection for YouTube videos with resolvable URLs.
  if (storage.persistent) {
    const now = Date.now();
    for (const v of videos.filter((x) => x.platform === "YouTube" && extractYouTubeVideoId(x.url))) {
      const snap = await getLatestMetricSnapshot(v.id);
      const isStale = !snap || now - new Date(snap.capturedAt).getTime() > STALE_MS;
      if (isStale) {
        issues.push({
          id: `dyn-stale-${v.id}`,
          entityType: "video", entityId: v.id,
          severity: "warning", issueType: "stale_metrics",
          title: `${v.creatorName}: no fresh YouTube snapshot`,
          description: snap
            ? `Last snapshot captured ${new Date(snap.capturedAt).toLocaleString("en-IN")} (>48h old).`
            : "No YouTube snapshot has ever been captured for this video.",
          suggestedFix: "Trigger a YouTube sync.",
          owner: "Shivam", status: "open",
        });
      }
    }
  }

  const runs = await listSyncRuns(10);
  const lastSyncSummary = runs.length === 0
    ? "No sync runs recorded yet."
    : runs.slice(0, 5).map((r) => `${r.source}: ${r.status} (${new Date(r.startedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" })})`).join(" · ");

  return {
    issues,
    storageLabel: storage.label,
    storageDetail: storage.detail,
    storagePersistent: storage.persistent,
    lastSyncSummary,
  };
}

export default async function DataHealthPage() {
  const staticIssues = getAllDataIssues();
  const scores = calculateDataQualityScore();
  const [{ issues: dynamicIssues, storageLabel, storageDetail, storagePersistent, lastSyncSummary }, dub] = await Promise.all([
    buildDynamicIssues(),
    getDubStats(),
  ]);
  const intelligence = buildDashboardIntelligence(dub.byVideo);
  const issues = [...dynamicIssues, ...staticIssues];

  const critical = issues.filter(i => i.severity === "critical" && i.status === "open");
  const warnings = issues.filter(i => i.severity === "warning" && i.status === "open");
  const infos    = issues.filter(i => i.severity === "info" && i.status === "open");
  const resolved = issues.filter(i => i.status === "resolved");

  const sections = [
    { title: "Critical Issues",   items: critical, color: "#ef4444", bg: "#fef2f2" },
    { title: "Warnings",          items: warnings, color: "#d97706", bg: "#fffbeb" },
    { title: "Info / Operational", items: infos,  color: "#3b82f6", bg: "#eff6ff" },
    { title: "Resolved",          items: resolved, color: "#10b981", bg: "#f0fdf4" },
  ].filter(s => s.items.length > 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Data Health</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Understand what you can and cannot trust. Static issues plus live sync freshness checks.
        </p>
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: storagePersistent ? "#10b981" : "#f59e0b" }}
          />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sync status — {storageLabel}
          </h2>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {storageDetail} · {lastSyncSummary}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Overall", value: scores.overall },
          { label: "Coverage", value: scores.metricCompleteness },
          { label: "Attribution", value: scores.attributionConfidence },
          { label: "Costs", value: scores.costConfidence },
          { label: "Freshness", value: scores.freshness },
          { label: "Source", value: scores.sourceReliability },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-3xl font-bold tabular-nums"
              style={{ color: value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444" }}>
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>/100</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Source Coverage</h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Coverage across live videos. This is the quickest read on whether CPI/CPV decisions are precise enough.
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: dub.partial ? "#f59e0b22" : "#10b98122", color: dub.partial ? "#d97706" : "#10b981" }}
          >
            Dub {dub.partial ? "fallback" : "live"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {intelligence.coverage.map((metric) => {
            const color = metric.tone === "good" ? "#10b981" : metric.tone === "warn" ? "#f59e0b" : "#ef4444";
            return (
              <div key={metric.id} className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{metric.label}</p>
                  <span className="text-sm font-black tabular-nums" style={{ color }}>{metric.pct}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
                  <div className="h-full rounded-full" style={{ width: `${metric.pct}%`, background: color }} />
                </div>
                <p className="text-[0.65rem] mt-2" style={{ color: "var(--text-muted)" }}>{metric.known}/{metric.total} · {metric.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Platform Precision</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Same source data grouped by platform so channel decisions can be compared cleanly.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Platform", "Videos", "Views", "Clicks", "Installs", "Spend", "CPI", "CPV"].map((header) => (
                  <th key={header} className="text-left px-3 py-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {intelligence.platforms.map((row) => (
                <tr key={row.platform} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--text-primary)" }}>{row.platform}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: "var(--text-secondary)" }}>{row.videos}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: "var(--text-secondary)" }}>{row.views ? row.views.toLocaleString("en-IN") : "—"}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: "var(--text-secondary)" }}>{row.clicks ? row.clicks.toLocaleString("en-IN") : "—"}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: "var(--accent)" }}>{row.installs ? row.installs.toLocaleString("en-IN") : "—"}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: "var(--text-secondary)" }}>{row.spendINR ? `₹${Math.round(row.spendINR / 1000).toLocaleString("en-IN")}K` : "—"}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: row.cpiINR != null && row.cpiINR <= 300 ? "#10b981" : row.cpiINR != null ? "#f59e0b" : "var(--text-muted)" }}>{row.cpiINR != null ? `₹${row.cpiINR.toFixed(0)}` : "—"}</td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: row.cpvINR != null && row.cpvINR <= 0.5 ? "#10b981" : row.cpvINR != null ? "#f59e0b" : "var(--text-muted)" }}>{row.cpvINR != null ? `₹${row.cpvINR.toFixed(2)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sections.map(({ title, items, color, bg }) => (
        <div key={title}>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {title} <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>({items.length})</span>
          </h2>
          <div className="space-y-2">
            {items.map((issue: DataIssue) => (
              <div key={issue.id} className="rounded-lg p-4"
                style={{ background: bg, border: `1px solid ${color}33` }}>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold uppercase mt-0.5 px-2 py-0.5 rounded whitespace-nowrap"
                    style={{ background: color + "22", color }}>
                    {issue.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{issue.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{issue.description}</p>
                    {issue.suggestedFix && (
                      <p className="text-xs mt-1 font-medium" style={{ color }}>Fix: {issue.suggestedFix}</p>
                    )}
                    {issue.owner && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Owner: {issue.owner} · {issue.entityType}/{issue.entityId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Calculation Notes</h2>
        <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <p><strong>YouTube Impressions:</strong> Real YT Studio data for v87, v88, v91, v94. All other YT videos use estimated impressions = views ÷ 0.04 (4% assumed thumbnail CTR). Confidence: Low.</p>
          <p><strong>Installs:</strong> Dub leads (primary). Manual records as fallback. Never defaults to 0 for missing attribution; shows blank-state dashes instead.</p>
          <p><strong>Shared Attribution:</strong> Ishan (v87/v88/v94), CA Nandini (v7/v92), Anurag (v79/v89/v90/v93) share Dub slugs. Video-level CPI unavailable — creator-level CPI only.</p>
          <p><strong>WLDD Costs:</strong> Actual per-creator costs are confirmed from the WLDD master sheet as of 2026-06-27.</p>
          <p><strong>ROAS:</strong> Not calculated — no revenue or LTV data connected.</p>
          <p><strong>June YouTube:</strong> Excludes v88 (Apr 25 go-live). v72/v74/v75 view counts may be unverified estimates.</p>
          <p><strong>Currency:</strong> All costs in INR. 1 USD = ₹84.</p>
        </div>
      </div>
    </div>
  );
}
