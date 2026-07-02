import { videos, performances, costs, installs, creators } from "@/lib/mock-data";
import { getDubStats } from "@/lib/dub-server";
import { ATTRIBUTION_GROUPS } from "@/lib/attribution";
import { calculateCPI, calculateCPV, formatCurrencyINR, formatNullableNumber } from "@/lib/metrics";
import { OPEN_ACTION_ITEMS, PRIORITY_COLOR } from "@/lib/action-items";

export default async function DecisionPage() {
  const dub = await getDubStats();
  const dubByVideo = dub.byVideo;

  const summaries = creators
    .map(c => {
      const cVideos = videos.filter(v => v.creatorId === c.id && v.status === "Live");
      const totalViews = cVideos.reduce((s, v) => {
        const p = performances.find(perf => perf.videoId === v.id);
        return s + (p?.views && p.views > 0 ? p.views : 0);
      }, 0);
      const totalSpend = costs.filter(c2 => c2.creatorId === c.id).reduce((s, c2) => s + c2.netCost, 0);
      const totalInstalls = cVideos.reduce((s, v) => {
        const d = dubByVideo[v.id];
        if (d !== undefined) return s + d.leads;
        const rec = installs.find(i => i.videoId === v.id);
        return s + (rec?.installs ?? 0);
      }, 0);
      const hasSharedAttribution = ATTRIBUTION_GROUPS.some(g => g.creatorIds.includes(c.id));
      const cpi = hasSharedAttribution ? null : calculateCPI(totalSpend, totalInstalls);
      const cpv = calculateCPV(totalSpend, totalViews);
      return { creator: c, totalViews, totalSpend, totalInstalls, cpi, cpv, hasSharedAttribution, videoCount: cVideos.length };
    })
    .filter(s => s.totalSpend > 0 || s.totalViews > 0)
    .sort((a, b) => {
      if (a.cpi == null && b.cpi == null) return 0;
      if (a.cpi == null) return 1;
      if (b.cpi == null) return -1;
      return a.cpi - b.cpi;
    });

  function rec(s: (typeof summaries)[0]): { label: string; color: string } {
    if (s.hasSharedAttribution) return { label: "Fix attribution first", color: "#d97706" };
    if (s.cpi == null || s.totalInstalls === 0) return { label: "Insufficient data", color: "#6b7280" };
    const cpiUSD = s.cpi / 84;
    if (cpiUSD < 5)  return { label: "Renew strongly",       color: "#10b981" };
    if (cpiUSD < 15) return { label: "Renew if price holds", color: "#3b82f6" };
    if (cpiUSD < 30) return { label: "Renegotiate price",    color: "#f59e0b" };
    return { label: "Do not renew", color: "#ef4444" };
  }

  const decisionRows = summaries.map((s) => ({ ...s, recommendation: rec(s) }));
  const renewalGroups = [
    { label: "Renew strongly", detail: "Efficient at current price", color: "#10b981" },
    { label: "Renew if price holds", detail: "Good, but keep pricing disciplined", color: "#3b82f6" },
    { label: "Renegotiate price", detail: "Performance needs better commercial terms", color: "#f59e0b" },
    { label: "Fix attribution first", detail: "Do not judge video CPI yet", color: "#d97706" },
    { label: "Do not renew", detail: "Spend is not clearing CPI guardrails", color: "#ef4444" },
  ].map((group) => {
    const items = decisionRows.filter((s) => s.recommendation.label === group.label);
    return {
      ...group,
      count: items.length,
      spend: items.reduce((sum, item) => sum + item.totalSpend, 0),
      installs: items.reduce((sum, item) => sum + item.totalInstalls, 0),
      names: items.slice(0, 3).map((item) => item.creator.name),
    };
  });

  const priorityMoves = decisionRows
    .filter((s) => s.recommendation.label !== "Insufficient data")
    .slice(0, 8);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Decision Center</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Renewal recommendations and budget allocation guidance. Logic is transparent — see confidence.
        </p>
      </div>

      {/* ROAS notice — theme-aware */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          color: "var(--text-secondary)",
        }}
      >
        <strong style={{ color: "var(--text-primary)" }}>ROAS unavailable</strong>
        {" "}— no revenue or LTV data connected. Efficiency uses CPI and CPV only.
      </div>

      <section>
        <div className="mb-3">
          <h2 className="section-heading">Renewal Board</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Budget posture by recommendation, not just raw CPI order.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {renewalGroups.map((group) => (
            <div
              key={group.label}
              className="rounded-xl p-4"
              style={{ background: "var(--bg-card)", border: `1px solid ${group.color}33`, boxShadow: "var(--nm-sm)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: group.color }}>{group.label}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{group.detail}</p>
                </div>
                <span className="text-2xl font-black tabular-nums" style={{ color: group.color }}>{group.count}</span>
              </div>
              <p className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
                {formatCurrencyINR(group.spend)} spend · {formatNullableNumber(group.installs)} installs
              </p>
              {group.names.length > 0 && (
                <p className="text-xs mt-2 truncate" style={{ color: "var(--text-muted)" }}>
                  {group.names.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-heading mb-4">Next Budget Moves</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {priorityMoves.slice(0, 6).map((s) => (
            <div key={s.creator.id} className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: `1px solid ${s.recommendation.color}33` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{s.creator.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {s.videoCount} video{s.videoCount === 1 ? "" : "s"} · {formatCurrencyINR(s.totalSpend)} spend
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap" style={{ background: `${s.recommendation.color}22`, color: s.recommendation.color }}>
                  {s.recommendation.label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <span style={{ color: "var(--text-secondary)" }}>CPI {s.cpi != null ? `$${(s.cpi / 84).toFixed(1)}` : "—"}</span>
                <span style={{ color: "var(--text-secondary)" }}>Views {formatNullableNumber(s.totalViews)}</span>
                <span style={{ color: "var(--text-secondary)" }}>Installs {s.hasSharedAttribution ? "Shared" : formatNullableNumber(s.totalInstalls)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Actions */}
      <section className="card p-6">
        <h2 className="section-heading mb-4">Recommended Actions</h2>
        <div className="space-y-2">
          {OPEN_ACTION_ITEMS.map((item) => {
            const c = PRIORITY_COLOR[item.priority];
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl p-3 transition-colors"
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${c}33`,
                }}
              >
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap"
                  style={{ background: `${c}22`, color: c }}
                >
                  {item.priority}
                </span>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creator Renewal Matrix */}
      <section className="card p-6">
        <h2 className="section-heading mb-1">Creator Renewal Matrix</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Sorted by CPI (lower = better). CPI shown in USD (÷84). Shared attribution = creator-level only, video CPI unavailable.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Creator", "Platform", "Videos", "Views", "Installs", "Spend", "CPI (USD)", "CPV (₹)", "Attribution", "Recommendation"].map(h => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {decisionRows.map((s, i) => {
                const r = s.recommendation;
                return (
                  <tr
                    key={s.creator.id}
                    className="transition-colors"
                    style={{ borderBottom: i < summaries.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={undefined}
                  >
                    <td className="py-2.5 px-3 font-medium" style={{ color: "var(--text-primary)" }}>{s.creator.name}</td>
                    <td className="py-2.5 px-3" style={{ color: "var(--text-secondary)" }}>{s.creator.platform}</td>
                    <td className="py-2.5 px-3 text-center" style={{ color: "var(--text-secondary)" }}>{s.videoCount}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>{formatNullableNumber(s.totalViews)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {s.hasSharedAttribution
                        ? <span className="text-xs" style={{ color: "#d97706" }}>Shared</span>
                        : formatNullableNumber(s.totalInstalls)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>{formatCurrencyINR(s.totalSpend)}</td>
                    <td className="py-2.5 px-3 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
                      {s.cpi != null ? `$${(s.cpi / 84).toFixed(1)}` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
                      {s.cpv != null ? `₹${s.cpv.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md"
                        style={{
                          background: s.hasSharedAttribution
                            ? "rgba(245,158,11,0.12)"
                            : "rgba(16,185,129,0.12)",
                          color: s.hasSharedAttribution ? "#d97706" : "#059669",
                        }}
                      >
                        {s.hasSharedAttribution ? "Creator" : "Video"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-md"
                        style={{ background: `${r.color}22`, color: r.color }}
                      >
                        {r.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
