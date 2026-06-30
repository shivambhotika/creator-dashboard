import { getAllDataIssues, calculateDataQualityScore } from "@/lib/data-quality";
import type { DataIssue } from "@/types";
import { isDbConnected, getLatestMetricSnapshot, listSyncRuns } from "@/lib/storage";
import { videos } from "@/lib/mock-data";
import { extractYouTubeVideoId } from "@/lib/youtube";

const STALE_MS = 48 * 60 * 60 * 1000;

async function buildDynamicIssues(): Promise<{ issues: DataIssue[]; dbConnected: boolean; lastSyncSummary: string }> {
  const issues: DataIssue[] = [];
  const dbConnected = await isDbConnected();

  if (!dbConnected) {
    issues.push({
      id: "dyn-snapshot-db-missing",
      entityType: "system", entityId: "storage",
      severity: "critical", issueType: "unknown_zero",
      title: "Snapshot database not connected",
      description: "DATABASE_URL is not configured. Live metric snapshots and sync history are not persisted; dashboard uses seed/static data.",
      suggestedFix: "Set DATABASE_URL in the environment to enable persistent snapshots.",
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
  if (dbConnected) {
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

  return { issues, dbConnected, lastSyncSummary };
}

export default async function DataHealthPage() {
  const staticIssues = getAllDataIssues();
  const scores = calculateDataQualityScore();
  const { issues: dynamicIssues, dbConnected, lastSyncSummary } = await buildDynamicIssues();
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
          Understand what you can and cannot trust. Scraped: 2026-06-25.
        </p>
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: dbConnected ? "#10b981" : "#f59e0b" }}
          />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sync status — storage {dbConnected ? "connected" : "not connected"}
          </h2>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{lastSyncSummary}</p>
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
          <p><strong>Installs:</strong> Dub leads (primary). Manual records as fallback. Never defaults to 0 for missing attribution — shows "—".</p>
          <p><strong>Shared Attribution:</strong> Ishan (v87/v88/v94), CA Nandini (v7/v92), Anurag (v79/v89/v90/v93) share Dub slugs. Video-level CPI unavailable — creator-level CPI only.</p>
          <p><strong>WLDD Costs:</strong> ₹35L estimated allocation by tier × platform weight. Never present as exact per-creator costs.</p>
          <p><strong>ROAS:</strong> Not calculated — no revenue or LTV data connected.</p>
          <p><strong>June YouTube:</strong> Excludes v88 (Apr 25 go-live). v72/v74/v75 view counts may be unverified estimates.</p>
          <p><strong>Currency:</strong> All costs in INR. 1 USD = ₹84.</p>
        </div>
      </div>
    </div>
  );
}
