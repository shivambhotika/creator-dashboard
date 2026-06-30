import { NextRequest, NextResponse } from "next/server";
import { syncSheets } from "@/lib/sync/sheets";

function verifyDashboardAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("wispr_auth")?.value;
  return cookie === "wispr_india_2026_authed";
}

export async function POST(req: NextRequest) {
  if (!verifyDashboardAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await syncSheets();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
