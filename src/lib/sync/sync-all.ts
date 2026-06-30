import type { SyncResult } from "@/types";
import { createSyncRun, updateSyncRun } from "@/lib/storage";
import { syncSheets } from "@/lib/sync/sheets";
import { syncYouTubeSnapshots } from "@/lib/youtube";
import { syncDubAll } from "@/lib/sync/dub";
import { recomputeInferredAttribution } from "@/lib/sync/attribution";
import { mergeSyncWarnings } from "@/lib/sync/utils";

export async function syncAll(triggeredBy: "cron" | "manual" | "system" = "system"): Promise<SyncResult> {
  const run = await createSyncRun({ source: "all", triggeredBy });

  const results: SyncResult[] = [];
  const errors: string[] = [];

  for (const step of [syncSheets, syncYouTubeSnapshots, syncDubAll, recomputeInferredAttribution]) {
    try {
      results.push(await step());
    } catch (err) {
      errors.push(`${step.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const warnings = mergeSyncWarnings(...results);
  const allErrors = [...errors, ...results.flatMap((r) => r.errors)];
  const itemsCreated = results.reduce((s, r) => s + (r.itemsCreated ?? 0), 0);
  const rowsRead = results.reduce((s, r) => s + (r.rowsRead ?? 0), 0);

  const status: SyncResult["status"] =
    results.some((r) => r.status === "failed") || errors.length > 0
      ? results.every((r) => r.status === "failed")
        ? "failed"
        : "partial"
      : results.some((r) => r.status === "partial")
        ? "partial"
        : "success";

  const merged: SyncResult = {
    source: "all",
    status,
    rowsRead,
    itemsCreated,
    warnings,
    errors: allErrors,
    metadata: { steps: results.map((r) => ({ source: r.source, status: r.status })) },
  };

  await updateSyncRun(run.id, {
    status,
    completedAt: new Date().toISOString(),
    rowsRead,
    itemsCreated,
    warnings,
    errors: allErrors,
    metadata: merged.metadata,
  });

  return merged;
}
