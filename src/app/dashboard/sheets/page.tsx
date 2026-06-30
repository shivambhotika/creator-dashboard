import { FileSpreadsheet } from "lucide-react";
import { SHEET_SOURCES } from "@/lib/sync/sheets";
import { getLatestSyncRun, isDbConnected } from "@/lib/storage";
import { SheetSyncControls } from "@/components/SheetSyncControls";

function fmt(dt?: string | null): string {
  if (!dt) return "never";
  try {
    return new Date(dt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  } catch {
    return dt;
  }
}

interface PerSheet {
  status?: string;
  rowsRead?: number;
  columns?: number;
  schemaErrors?: string[];
}

export default async function SheetsPage() {
  const [lastSync, dbConnected] = await Promise.all([getLatestSyncRun("sheets"), isDbConnected()]);
  const perSheet = (lastSync?.metadata?.perSheet as Record<string, PerSheet> | undefined) ?? {};

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Connected Sheets</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Allowlisted Google Sheets synced into the dashboard. Last sheets sync: {fmt(lastSync?.completedAt ?? lastSync?.startedAt)}
            {lastSync ? ` · ${lastSync.status}` : ""}.
          </p>
        </div>
        <SheetSyncControls />
      </div>

      {!dbConnected && (
        <p className="text-xs mb-4 rounded-lg p-2" style={{ background: "#fffbeb", color: "#92400e" }}>
          Sync storage not connected — sync runs are observed in-memory only and will not persist between deploys.
        </p>
      )}

      <div className="space-y-3">
        {SHEET_SOURCES.map((sheet) => {
          const info = perSheet[sheet.id];
          const url = `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`;
          return (
            <div
              key={sheet.id}
              className="rounded-xl p-4 flex items-start gap-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--bg-surface)" }}
              >
                <FileSpreadsheet className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{sheet.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    {sheet.agency}
                  </span>
                  {info?.status && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: info.status === "ok" ? "#10b98122" : "#f59e0b22",
                        color: info.status === "ok" ? "#10b981" : "#d97706",
                      }}
                    >
                      {info.status}
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Rows read: {info?.rowsRead ?? "—"} · Columns: {info?.columns ?? "—"}
                </p>
                {info?.schemaErrors && info.schemaErrors.length > 0 && (
                  <ul className="text-xs mt-1 list-disc pl-4" style={{ color: "#d97706" }}>
                    {info.schemaErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
                {(lastSync?.warnings ?? []).filter((w) => w.startsWith(sheet.id)).map((w, i) => (
                  <p key={i} className="text-xs mt-1" style={{ color: "#d97706" }}>{w}</p>
                ))}
              </div>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg shrink-0"
                style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                Open
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Agency instructions</h2>
        <ul className="text-xs space-y-1 list-disc pl-4" style={{ color: "var(--text-secondary)" }}>
          <li>Use the 5-tab template: Deliverables, Insights, Costs, Issues, Instructions (see docs/agency-sheet-template.md).</li>
          <li>Do not merge cells, rename header columns, or reorder tabs — the sync validates the header row.</li>
          <li>Share the sheet as &quot;Anyone with the link can view&quot; so CSV export works.</li>
          <li>Provide one unique Dub ref link per video so video-level attribution stays exact.</li>
          <li>Confirmed zeros must be entered as 0; unknown values left blank (never fake a 0).</li>
        </ul>
      </div>
    </div>
  );
}
