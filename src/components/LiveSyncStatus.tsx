"use client";

import { useState } from "react";
import type { SyncRun } from "@/types";

interface LiveSyncStatusProps {
  lastSyncs: Record<string, SyncRun | null>;
  storage: {
    persistent: boolean;
    label: string;
    detail: string;
  };
}

interface SyncButton {
  label: string;
  endpoint: string;
  sourceKey: string;
}

const BUTTONS: SyncButton[] = [
  { label: "Refresh all", endpoint: "/api/sync/all", sourceKey: "all" },
  { label: "Refresh sheets", endpoint: "/api/sync/sheets", sourceKey: "sheets" },
  { label: "Refresh YouTube", endpoint: "/api/sync/youtube", sourceKey: "youtube" },
  { label: "Refresh Dub", endpoint: "/api/sync/dub", sourceKey: "dub" },
  { label: "Recompute attribution", endpoint: "/api/sync/attribution", sourceKey: "attribution" },
];

function fmt(dt?: string | null): string {
  if (!dt) return "never";
  try {
    return new Date(dt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  } catch {
    return dt;
  }
}

const STATUS_COLOR: Record<string, string> = {
  success: "#10b981",
  partial: "#f59e0b",
  failed: "#ef4444",
  running: "#3b82f6",
  queued: "#6b7280",
};

export function LiveSyncStatus({ lastSyncs, storage }: LiveSyncStatusProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runSync(btn: SyncButton) {
    setBusy(btn.sourceKey);
    setMessage(null);
    try {
      const res = await fetch(btn.endpoint, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setMessage(`${btn.label} failed: ${json.error ?? res.status}`);
      } else {
        setMessage(`${btn.label}: ${json.status ?? "done"}${json.itemsCreated != null ? ` · ${json.itemsCreated} items` : ""}`);
      }
    } catch (err) {
      setMessage(`${btn.label} error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Live Sync
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: storage.persistent ? "#10b98122" : "#f59e0b22",
            color: storage.persistent ? "#10b981" : "#d97706",
          }}
        >
          {storage.label}
        </span>
      </div>

      {!storage.persistent && (
        <p className="text-xs mb-3 rounded-lg p-2" style={{ background: "#fffbeb", color: "#92400e" }}>
          {storage.detail}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {Object.entries(lastSyncs).map(([source, run]) => (
          <div key={source} className="rounded-lg p-2" style={{ background: "var(--bg-surface)" }}>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: run ? STATUS_COLOR[run.status] ?? "#6b7280" : "#6b7280" }}
              />
              <span className="text-xs font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                {source}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {run ? `${run.status} · ${fmt(run.completedAt ?? run.startedAt)}` : "never"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((btn) => (
          <button
            key={btn.sourceKey}
            onClick={() => runSync(btn)}
            disabled={busy !== null}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            {busy === btn.sourceKey ? "Syncing…" : btn.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LiveSyncStatus;
