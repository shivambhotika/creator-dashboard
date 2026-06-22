"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";

const SHEET_KEYS = [
  { key: "creators",    label: "Creators Sheet",     desc: "One row per creator. Columns: Name, Handle, Platform, Tier, Niche, Agency, Contact, Status, Followers, AvgViews" },
  { key: "videos",      label: "Videos Sheet",        desc: "One row per video. Columns: ID, CreatorName, Title, URL, Platform, GoLiveDate, Format, CampaignID, Status" },
  { key: "performance", label: "Performance Sheet",   desc: "One row per video. Columns: VideoID, Views, Likes, Comments, Shares, WatchTimeMinutes, ClickThroughs, Conversions, Revenue, RecordedAt" },
  { key: "costs",       label: "Costs Sheet",         desc: "One row per video. Columns: VideoID, CreatorID, GrossCost, AgencyFee, NetCost, CPV, CPM, Currency" },
  { key: "campaigns",   label: "Campaigns Sheet",     desc: "One row per campaign. Columns: ID, Name, Quarter, Budget, Goal, CreatorIDs (comma separated), Status" },
];

type Status = "idle" | "loading" | "ok" | "error";

interface SheetState {
  url: string;
  status: Status;
  rowCount?: number;
  error?: string;
}

const STORAGE_KEY = "creator_ops_sheet_urls";

export default function SettingsPage() {
  const [sheets, setSheets] = useState<Record<string, SheetState>>(
    Object.fromEntries(SHEET_KEYS.map((s) => [s.key, { url: "", status: "idle" }]))
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>;
        setSheets((prev) => {
          const next = { ...prev };
          Object.entries(parsed).forEach(([k, url]) => {
            if (next[k]) next[k] = { ...next[k], url };
          });
          return next;
        });
      }
    } catch {}
  }, []);

  function setUrl(key: string, url: string) {
    setSheets((prev) => ({ ...prev, [key]: { url, status: "idle" } }));
  }

  function save() {
    const urls = Object.fromEntries(Object.entries(sheets).map(([k, v]) => [k, v.url]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  }

  async function testSheet(key: string) {
    const url = sheets[key]?.url?.trim();
    if (!url) return;
    setSheets((prev) => ({ ...prev, [key]: { ...prev[key], status: "loading", error: undefined } }));
    try {
      const res = await fetch(`/api/sheets?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fetch failed");
      setSheets((prev) => ({ ...prev, [key]: { ...prev[key], status: "ok", rowCount: data.rows?.length ?? 0 } }));
      save();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSheets((prev) => ({ ...prev, [key]: { ...prev[key], status: "error", error: msg } }));
    }
  }

  async function testAll() {
    for (const s of SHEET_KEYS) {
      if (sheets[s.key]?.url?.trim()) await testSheet(s.key);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Google Sheets Setup</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Connect your sheets in 3 steps — no code, no OAuth needed.
        </p>
      </div>

      {/* How-to */}
      <div className="rounded-xl border p-5 mb-8" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>How to connect a sheet</h2>
        <ol className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Open your Google Sheet → <strong className="ml-1">File → Share → Publish to web</strong>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Select the correct tab, set format to <strong className="ml-1">Comma-separated values (.csv)</strong>, click Publish
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Copy the URL and paste it below, then click Test
          </li>
        </ol>
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}>
          The sheet must be publicly viewable. Data is cached for 5 minutes and fetched server-side — it never leaves your deployment.
        </p>
      </div>

      {/* Sheet URL fields */}
      <div className="space-y-4 mb-6">
        {SHEET_KEYS.map((s) => {
          const state = sheets[s.key];
          return (
            <div key={s.key} className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                </div>
                {state.status === "ok" && (
                  <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium shrink-0 ml-4">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {state.rowCount} rows
                  </span>
                )}
                {state.status === "error" && (
                  <span className="flex items-center gap-1 text-xs text-red-500 shrink-0 ml-4">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Error
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="url"
                  value={state.url}
                  onChange={(e) => setUrl(s.key, e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/…/pub?gid=0&single=true&output=csv"
                  className="flex-1 text-xs rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
                <button
                  onClick={() => testSheet(s.key)}
                  disabled={!state.url.trim() || state.status === "loading"}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  {state.status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Test
                </button>
              </div>
              {state.error && (
                <p className="text-xs text-red-400 mt-2">{state.error}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { save(); testAll(); }}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          Save & Test All
        </button>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          URLs are saved locally in your browser and used to pull live data.
        </p>
      </div>

      {/* Column format reference */}
      <div className="mt-10">
        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Sheet column reference</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: `1px solid var(--border)` }}>
                <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--text-muted)" }}>Sheet</th>
                <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--text-muted)" }}>Required columns (exact header names)</th>
              </tr>
            </thead>
            <tbody style={{ background: "var(--bg-card)" }}>
              {[
                ["Creators", "Name, Handle, Platform, Tier, Niche, Agency, Contact, Status, Followers, AvgViews"],
                ["Videos", "ID, CreatorID, CreatorName, Title, URL, Platform, GoLiveDate, Format, CampaignID, Status"],
                ["Performance", "VideoID, Views, Likes, Comments, Shares, WatchTimeMinutes, ClickThroughs, Conversions, Revenue, RecordedAt"],
                ["Costs", "VideoID, CreatorID, GrossCost, AgencyFee, NetCost, CPV, CPM, Currency"],
                ["Campaigns", "ID, Name, Quarter, Budget, Goal, CreatorIDs, Status"],
              ].map(([sheet, cols]) => (
                <tr key={sheet} style={{ borderBottom: `1px solid var(--border-subtle)` }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: "var(--text-primary)" }}>{sheet}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{cols}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Headers are case-sensitive. You can add extra columns — they will be ignored. Empty rows are skipped.
        </p>
      </div>
    </div>
  );
}
