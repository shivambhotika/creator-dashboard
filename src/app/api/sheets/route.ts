import { NextRequest, NextResponse } from "next/server";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";
import { SHEET_SOURCES } from "@/lib/sync/sheet-sources";

const ALLOWED_SHEET_IDS = SHEET_SOURCES.map((source) => source.spreadsheetId);

export async function GET(req: NextRequest) {
  if (!(await verifyDashboardRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sheetId = req.nextUrl.searchParams.get("sheetId");
  const gid = req.nextUrl.searchParams.get("gid") ?? "0";

  if (!sheetId) {
    return NextResponse.json({ error: "sheetId required" }, { status: 400 });
  }

  if (!ALLOWED_SHEET_IDS.includes(sheetId)) {
    return NextResponse.json({ error: "Sheet not in allowlist" }, { status: 403 });
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch sheet" }, { status: res.status });
    }
    const csv = await res.text();
    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv" },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
