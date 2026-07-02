import { NextRequest, NextResponse } from "next/server";
import { syncDubAll } from "@/lib/sync/dub";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  if (!(await verifyDashboardRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await syncDubAll();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
