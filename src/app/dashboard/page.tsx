import { creators, videos, performances, costs, campaigns, installs, getAllCreatorMetrics, getCampaignStats } from "@/lib/mock-data";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Download, DollarSign, TrendingUp, Users, Target, Zap, BarChart2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/Badge";
import { statusBadge } from "@/lib/badges";
import { OverviewCharts } from "@/components/OverviewCharts";
import { getDubStats } from "@/lib/dub-server";

export default async function DashboardPage() {
  const [allMetrics, dub] = await Promise.all([
    Promise.resolve(getAllCreatorMetrics()),
    getDubStats(),
  ]);

  // Top-line numbers
  const totalInstalls   = installs.reduce((s, i) => s + i.installs, 0);
  const totalRevenue    = installs.reduce((s, i) => s + (i.revenue ?? 0), 0);
  const totalSpend      = costs.reduce((s, c) => s + c.netCost, 0);
  const totalViews      = performances.reduce((s, p) => s + p.views, 0);
  // Live Dub clicks take precedence over cached performance.clickThroughs
  const totalClicks     = dub.totalClicks > 0
    ? dub.totalClicks
    : performances.reduce((s, p) => s + p.clickThroughs, 0);
  const totalLeads      = dub.totalLeads > 0 ? dub.totalLeads : totalInstalls;
  const overallCPI      = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const overallROAS     = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const overallC2I      = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;
  const activeCreators  = creators.filter((c) => c.status === "Active").length;
  const liveVideos      = videos.filter((v) => v.status === "Live").length;

  // Ranked creators by efficiency
  const ranked = [...allMetrics]
    .filter((m) => m.videoCount > 0 && m.totalInstalls > 0)
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Overview</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Creator marketing · Install attribution via Dub
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-surface)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {liveVideos} videos live
          </div>
          {!dub.partial && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-indigo-300 dark:border-indigo-700"
              style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Dub live
            </div>
          )}
        </div>
      </div>

      {/* Primary KPIs — install-first */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total Installs"
          value={formatNumber(totalInstalls)}
          sub={`${liveVideos} live videos`}
          icon={Download}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-100 dark:bg-indigo-500/10"
        />
        <StatCard
          label="CPI (Cost per Install)"
          value={formatCurrency(overallCPI)}
          sub="net spend / installs"
          icon={Target}
          iconColor="text-rose-500"
          iconBg="bg-rose-100 dark:bg-rose-500/10"
        />
        <StatCard
          label="ROAS"
          value={`${overallROAS.toFixed(2)}x`}
          sub={`Revenue ${formatCurrency(totalRevenue)}`}
          icon={TrendingUp}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100 dark:bg-emerald-500/10"
        />
        <StatCard
          label="Net Spend"
          value={formatCurrency(totalSpend)}
          sub="across all campaigns"
          icon={DollarSign}
          iconColor="text-amber-500"
          iconBg="bg-amber-100 dark:bg-amber-500/10"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Click → Lead Rate"
          value={`${overallC2I.toFixed(1)}%`}
          sub={`${formatNumber(totalClicks)} clicks · ${formatNumber(totalLeads)} leads`}
          icon={Zap}
          iconColor="text-violet-500"
          iconBg="bg-violet-100 dark:bg-violet-500/10"
        />
        <StatCard
          label="Total Views"
          value={formatNumber(totalViews)}
          sub={`CPV ${formatCurrency(totalViews > 0 ? totalSpend / totalViews : 0)}`}
          icon={BarChart2}
          iconColor="text-sky-500"
          iconBg="bg-sky-100 dark:bg-sky-500/10"
        />
        <StatCard
          label="Active Creators"
          value={String(activeCreators)}
          sub={`${creators.length} total roster`}
          icon={Users}
          iconColor="text-teal-500"
          iconBg="bg-teal-100 dark:bg-teal-500/10"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub="attributed via Dub"
          icon={DollarSign}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100 dark:bg-emerald-500/10"
        />
      </div>

      {/* Charts */}
      <OverviewCharts
        costs={costs}
        creators={creators}
        performances={performances}
        installs={installs}
        videos={videos}
      />

      {/* Campaigns + creator ranking */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Campaigns */}
        <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Campaigns</h2>
          <div className="space-y-5">
            {campaigns.map((camp) => {
              const stats = getCampaignStats(camp.id);
              const pacing = stats?.pacingPct ?? 0;
              return (
                <div key={camp.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{camp.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {camp.creatorIds.length} creators · {camp.goal}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {stats ? formatNumber(stats.installs) : "—"} installs
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        CPI {stats?.cpi ? formatCurrency(stats.cpi) : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Budget pacing bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                      <div
                        className={`h-full rounded-full ${pacing > 90 ? "bg-red-500" : pacing > 70 ? "bg-amber-500" : "bg-indigo-500"}`}
                        style={{ width: `${Math.min(pacing, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                      {pacing.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge label={camp.status} className={statusBadge[camp.status]} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {stats ? formatCurrency(stats.spent) : "—"} of {formatCurrency(camp.totalBudget)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Creator efficiency ranking */}
        <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Creator Efficiency Ranking</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
              Score /100
            </span>
          </div>
          <div className="space-y-4">
            {ranked.map((m, i) => {
              const creator = creators.find((c) => c.id === m.creatorId);
              if (!creator) return null;
              return (
                <div key={m.creatorId} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 text-center shrink-0 ${
                    i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-600" : ""
                  }`} style={i > 2 ? { color: "var(--text-muted)" } : {}}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {creator.name}
                      </p>
                      <span className="text-xs font-bold ml-2 shrink-0" style={{ color: "var(--text-primary)" }}>
                        {m.efficiencyScore}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--bg-surface)" }}>
                      <div
                        className={`h-full rounded-full ${i === 0 ? "bg-amber-500" : "bg-indigo-500"}`}
                        style={{ width: `${m.efficiencyScore}%` }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        CPI {formatCurrency(m.cpi)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        C→I {m.clickToInstallRate.toFixed(1)}%
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        ROAS {m.roas.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {ranked.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
                No install data yet — connect Dub in Settings
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign comparison */}
      <div className="mt-4 rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Campaign Comparison</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Side-by-side efficiency across all campaigns</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                {["Campaign", "Platform", "Creators", "Views", "Installs", "CPI", "CPV", "Spend"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp, i) => {
                const stats = getCampaignStats(camp.id);
                const campPerfs = performances.filter(p => {
                  const v = videos.find(v => v.id === p.videoId);
                  return v?.campaignId === camp.id;
                });
                const totalViews = campPerfs.reduce((s, p) => s + p.views, 0);
                const cpv = totalViews > 0 && stats && stats.spent > 0 ? stats.spent / totalViews : 0;
                return (
                  <tr key={camp.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{camp.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{camp.status}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{camp.primaryPlatform}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{camp.creatorIds.length}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{totalViews > 0 ? formatNumber(totalViews) : "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-500">{stats && stats.installs > 0 ? formatNumber(stats.installs) : "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      {stats && stats.cpi > 0 ? (
                        <span className={stats.cpi <= 300 ? "text-emerald-500" : stats.cpi <= 800 ? "text-amber-500" : "text-red-500"}>
                          {formatCurrency(stats.cpi)}
                        </span>
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{cpv > 0 ? formatCurrency(cpv) : "—"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{stats && stats.spent > 0 ? formatCurrency(stats.spent) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
