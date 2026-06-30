import { videos, performances, costs, installs, creators } from "@/lib/mock-data";
import { getDubStats } from "@/lib/dub-server";
import { ATTRIBUTION_GROUPS } from "@/lib/attribution";
import { calculateCPI, calculateCPV, formatCurrencyINR, formatNullableNumber } from "@/lib/metrics";

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
    if (cpiUSD < 5)  return { label: "Renew strongly",      color: "#10b981" };
    if (cpiUSD < 15) return { label: "Renew if price holds", color: "#3b82f6" };
    if (cpiUSD < 30) return { label: "Renegotiate price",    color: "#f59e0b" };
    return { label: "Do not renew", color: "#ef4444" };
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Decision Center</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Renewal recommendations and budget allocation guidance. Logic is transparent — see confidence.
        </p>
      </div>

      <div className="rounded-lg p-4 text-sm" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
        <strong>ROAS unavailable</strong> — no revenue or LTV data connected. Efficiency uses CPI and CPV only.
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Creator Renewal Matrix</h2>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          Sorted by CPI (lower = better). CPI shown in USD (÷84). Shared attribution = creator-level only, video CPI unavailable.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Creator","Platform","Videos","Views","Installs","Spend","CPI (USD)","CPV (₹)","Attribution","Recommendation"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaries.map(s => {
                const r = rec(s);
                return (
                  <tr key={s.creator.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 px-3 font-medium" style={{ color: "var(--text-primary)" }}>{s.creator.name}</td>
                    <td className="py-2 px-3" style={{ color: "var(--text-secondary)" }}>{s.creator.platform}</td>
                    <td className="py-2 px-3 text-center" style={{ color: "var(--text-secondary)" }}>{s.videoCount}</td>
                    <td className="py-2 px-3 text-right" style={{ color: "var(--text-secondary)" }}>{formatNullableNumber(s.totalViews)}</td>
                    <td className="py-2 px-3 text-right" style={{ color: "var(--text-secondary)" }}>
                      {s.hasSharedAttribution
                        ? <span className="text-xs" style={{ color: "#d97706" }}>Shared</span>
                        : formatNullableNumber(s.totalInstalls)}
                    </td>
                    <td className="py-2 px-3 text-right" style={{ color: "var(--text-secondary)" }}>{formatCurrencyINR(s.totalSpend)}</td>
                    <td className="py-2 px-3 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
                      {s.cpi != null ? `$${(s.cpi / 84).toFixed(1)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
                      {s.cpv != null ? `₹${s.cpv.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: s.hasSharedAttribution ? "#fef3c7" : "#f0fdf4",
                                 color: s.hasSharedAttribution ? "#d97706" : "#059669" }}>
                        {s.hasSharedAttribution ? "Creator" : "Video"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-xs font-medium px-2 py-1 rounded"
                        style={{ background: r.color + "22", color: r.color }}>
                        {r.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Recommended Actions</h2>
        <div className="space-y-2">
          {[
            { p: "P0", t: "Create unique Dub slugs per video for Ishan, Nandini, and Anurag before next deal cycle.", c: "#ef4444" },
            { p: "P1", t: "Ask WLDD to fix Full Disclosure Dub slug — currently conflicts with financewithjobi (v53).", c: "#d97706" },
            { p: "P1", t: "Confirm actual video URLs for v72 (Sheryians), v74 (Arsh Goyal), v75 (Code And Bug).", c: "#d97706" },
            { p: "P2", t: "Request per-post breakdown for Anurag Bansal v93 (IG Reel 2) — currently aggregated with v79 total.", c: "#3b82f6" },
            { p: "P2", t: "Separate v88 Ishan April video from June reporting (use contracted spend basis).", c: "#3b82f6" },
            { p: "P2", t: "Connect revenue/LTV data to enable ROAS calculation.", c: "#3b82f6" },
          ].map(({ p, t, c }, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap"
                style={{ background: c + "22", color: c }}>{p}</span>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
