import { NextRequest, NextResponse } from "next/server";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";
import { getDubStats } from "@/lib/dub-server";
import { buildDashboardIntelligence } from "@/lib/insights";
import { getLatestSyncRun, getStorageStatus } from "@/lib/storage";

export async function GET(req: NextRequest) {
  if (!(await verifyDashboardRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dub, storage, sheetsSync, youtubeSync, dubSync] = await Promise.all([
    getDubStats(),
    getStorageStatus(),
    getLatestSyncRun("sheets"),
    getLatestSyncRun("youtube"),
    getLatestSyncRun("dub"),
  ]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    storage: {
      mode: storage.mode,
      persistent: storage.persistent,
      label: storage.label,
      detail: storage.detail,
    },
    syncs: {
      sheets: sheetsSync,
      youtube: youtubeSync,
      dub: dubSync,
    },
    dub: {
      partial: dub.partial,
      warnings: dub.warnings,
      fetchedAt: dub.fetchedAt,
    },
    intelligence: buildDashboardIntelligence(dub.byVideo),
  });
}
