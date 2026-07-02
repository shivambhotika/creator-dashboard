import type { SyncResult } from "@/types";
import { SHEET_SOURCES } from "@/lib/sync/sheet-sources";

export { SHEET_SOURCES };
export type { SheetSource } from "@/lib/sync/sheet-sources";

/** Minimal CSV parser — handles quoted fields and embedded commas/newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // ignore — handled by \n
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export async function syncSheets(): Promise<SyncResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  let rowsRead = 0;
  let rowsChanged = 0;
  const perSheet: Record<string, unknown> = {};

  for (const source of SHEET_SOURCES) {
    const url = `https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/export?format=csv${source.gid ? `&gid=${source.gid}` : ""}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        errors.push(`${source.id}: HTTP ${res.status} fetching CSV`);
        perSheet[source.id] = { status: "failed", httpStatus: res.status };
        continue;
      }
      const csv = await res.text();
      const rows = parseCsv(csv);
      const header = rows[0] ?? [];
      const dataRows = rows.slice(1);
      rowsRead += dataRows.length;

      // Schema validation
      const schemaErrors: string[] = [];
      for (const col of source.requiredColumns ?? []) {
        if (!header.some((h) => h.trim().toLowerCase() === col.toLowerCase())) {
          schemaErrors.push(`Missing required column "${col}"`);
        }
      }
      if (schemaErrors.length > 0) {
        warnings.push(`${source.id}: ${schemaErrors.join("; ")}`);
      }

      // We never overwrite confirmed mock/seed data silently — sheet sync is
      // observational here: it records what was read and flags changes for review.
      // "changed" is approximated as the number of non-empty data rows seen.
      rowsChanged += dataRows.length;

      perSheet[source.id] = {
        status: schemaErrors.length > 0 ? "schema_warning" : "ok",
        rowsRead: dataRows.length,
        columns: header.length,
        schemaErrors,
      };
    } catch (err) {
      errors.push(`${source.id}: ${err instanceof Error ? err.message : String(err)}`);
      perSheet[source.id] = { status: "error" };
    }
  }

  const status: SyncResult["status"] =
    errors.length === SHEET_SOURCES.length && SHEET_SOURCES.length > 0
      ? "failed"
      : errors.length > 0 || warnings.length > 0
        ? "partial"
        : "success";

  return {
    source: "sheets",
    status,
    rowsRead,
    rowsChanged,
    warnings,
    errors,
    metadata: { perSheet },
  };
}
