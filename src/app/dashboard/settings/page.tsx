"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { SHEET_SOURCES } from "@/lib/sync/sheet-sources";

type Status = "idle" | "loading" | "ok" | "error";

interface SheetState {
  status: Status;
  rowCount?: number;
  columnCount?: number;
  error?: string;
}

function countCsvRows(csv: string): { rows: number; columns: number } {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const header = lines[0] ?? "";
  return {
    rows: Math.max(lines.length - 1, 0),
    columns: header ? header.split(",").length : 0,
  };
}

export default function SettingsPage() {
  const [states, setStates] = useState<Record<string, SheetState>>({});

  const sources = useMemo(() => SHEET_SOURCES, []);

  async function testSheet(sourceId: string) {
    const source = sources.find((s) => s.id === sourceId);
    if (!source) return;

    setStates((prev) => ({ ...prev, [sourceId]: { status: "loading" } }));
    try {
      const params = new URLSearchParams({ sheetId: source.spreadsheetId });
      if (source.gid) params.set("gid", source.gid);
      const res = await fetch(`/api/sheets?${params.toString()}`);
      const text = await res.text();
      if (!res.ok) {
        let msg = text;
        try {
          msg = (JSON.parse(text) as { error?: string }).error ?? text;
        } catch {}
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const counts = countCsvRows(text);
      setStates((prev) => ({
        ...prev,
        [sourceId]: { status: "ok", rowCount: counts.rows, columnCount: counts.columns },
      }));
    } catch (err) {
      setStates((prev) => ({
        ...prev,
        [sourceId]: { status: "error", error: err instanceof Error ? err.message : String(err) },
      }));
    }
  }

  async function testAll() {
    for (const source of sources) {
      await testSheet(source.id);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Sheet Connections</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Test allowlisted Google Sheets used by the sync pipeline.
          </p>
        </div>
        <button
          onClick={testAll}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Test all
        </button>
      </div>

      <div className="rounded-xl border p-5 mb-8" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>How this works</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Sheet sources are configured in code and exposed only through the authenticated `/api/sheets`
          allowlist. Add or change sources in `src/lib/sync/sheet-sources.ts`, then run a sheet sync from
          the Overview or Connected Sheets page.
        </p>
      </div>

      <div className="space-y-4">
        {sources.map((source) => {
          const state = states[source.id] ?? { status: "idle" };
          const url = `https://docs.google.com/spreadsheets/d/${source.spreadsheetId}${source.gid ? `/edit#gid=${source.gid}` : ""}`;
          return (
            <div key={source.id} className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{source.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      {source.agency}
                    </span>
                    {source.gid && (
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>gid {source.gid}</span>
                    )}
                  </div>
                  <p className="text-xs mt-1 break-all" style={{ color: "var(--text-muted)" }}>
                    {source.spreadsheetId}
                  </p>
                  {source.requiredColumns && (
                    <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                      Required columns: {source.requiredColumns.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                  <button
                    onClick={() => testSheet(source.id)}
                    disabled={state.status === "loading"}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    {state.status === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Test
                  </button>
                </div>
              </div>

              {state.status === "ok" && (
                <p className="text-xs text-emerald-500 mt-3 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Connected: {state.rowCount} rows, {state.columnCount} columns
                </p>
              )}
              {state.status === "error" && (
                <p className="text-xs text-red-500 mt-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {state.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
