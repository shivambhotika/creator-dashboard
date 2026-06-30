"use client";

import { useState } from "react";

export function SheetSyncControls() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync/sheets", { method: "POST" });
      const json = await res.json();
      if (!res.ok) setMessage(`Failed: ${json.error ?? res.status}`);
      else setMessage(`${json.status}: read ${json.rowsRead ?? 0} rows`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={refresh}
        disabled={busy}
        className="text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
        style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
      >
        {busy ? "Refreshing…" : "Refresh all sheets"}
      </button>
      {message && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{message}</span>}
    </div>
  );
}

export default SheetSyncControls;
