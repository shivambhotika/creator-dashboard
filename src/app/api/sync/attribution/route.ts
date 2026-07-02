import { NextRequest, NextResponse } from "next/server";
import { recomputeInferredAttribution } from "@/lib/sync/attribution";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  if (!(await verifyDashboardRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await recomputeInferredAttribution();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
